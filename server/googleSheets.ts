import { JWT } from "google-auth-library";
import type { Invoice, InvoiceItem } from "@shared/schema";

// ── Config (set these in Vercel → Project → Settings → Environment Variables) ──
// GOOGLE_SERVICE_ACCOUNT_EMAIL : the "client_email" field from your downloaded JSON key
// GOOGLE_PRIVATE_KEY          : the "private_key" field from your downloaded JSON key
//                                (paste it exactly as-is, including \n characters)
// GOOGLE_SHEET_ID             : the long ID from your sheet's URL
// GOOGLE_SHEET_TAB            : optional, defaults to "Sheet1"

const SHEET_TAB = process.env.GOOGLE_SHEET_TAB || "Sheet1";
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

let cachedClient: JWT | null = null;

function getAuthClient(): JWT | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    console.warn(
      "[googleSheets] GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY not set — skipping sheet sync"
    );
    return null;
  }

  if (!cachedClient) {
    cachedClient = new JWT({
      email,
      key: key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  return cachedClient;
}

async function getAccessToken(): Promise<string | null> {
  const client = getAuthClient();
  if (!client) return null;
  const token = await client.getAccessToken();
  return token?.token ?? null;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
}

function invoiceToRow(invoice: Invoice, items?: InvoiceItem[]): (string | number)[] {
  const serviceNames = items && items.length > 0
    ? items.map((i) => i.title).join(", ")
    : "";

  return [
    invoice.invoiceNumber,
    formatDate(invoice.issueDate),
    formatDate(invoice.dueDate),
    invoice.currency,
    invoice.clientName,
    invoice.clientEmail,
    invoice.clientPhone,
    serviceNames,
    invoice.subtotal,
    invoice.taxValue ?? "0",
    invoice.totalAmount,
    invoice.paidAmount ?? "0",
    invoice.payableAmount ?? "0",
    invoice.status,
  ];
}

async function sheetsFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${SHEETS_API}/${SHEET_ID}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sheets API ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * DEBUG ONLY — does the same auth + read as syncInvoiceToSheet but throws
 * instead of swallowing errors, so we can see exactly what's failing.
 * Remove this + its route once sheet sync is confirmed working.
 */
export async function debugSheetConnection() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  const report: Record<string, any> = {
    has_GOOGLE_SHEET_ID: !!SHEET_ID,
    has_GOOGLE_SERVICE_ACCOUNT_EMAIL: !!email,
    has_GOOGLE_PRIVATE_KEY: !!key,
    GOOGLE_SHEET_TAB: SHEET_TAB,
    service_account_email_preview: email ? email.slice(0, 6) + "..." + email.slice(-20) : null,
  };

  if (!SHEET_ID) {
    report.error = "GOOGLE_SHEET_ID is missing in environment variables.";
    return report;
  }
  if (!email || !key) {
    report.error = "GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY is missing.";
    return report;
  }

  try {
    const token = await getAccessToken();
    report.got_access_token = !!token;
    if (!token) {
      report.error = "Failed to get access token from Google (bad key format?).";
      return report;
    }

    const data = await sheetsFetch(`/values/${encodeURIComponent(`${SHEET_TAB}!A1:A1`)}`, token);
    report.read_success = true;
    report.sample_data = data;
    report.message = "✅ Connection works! Auth + Sheets API read succeeded.";
  } catch (err: any) {
    report.error = err?.message || String(err);
  }

  return report;
}

/**
 * Creates the row if the invoice number doesn't exist yet in the sheet,
 * otherwise overwrites the existing row in place. Safe to call on both
 * invoice creation and invoice edits. Never throws — logs and returns on failure
 * so it can never break invoice creation/editing.
 */
export async function syncInvoiceToSheet(invoice: Invoice, items?: InvoiceItem[]) {
  try {
    if (!SHEET_ID) return;
    const token = await getAccessToken();
    if (!token) return;

    // 1. Read column A to find if this invoice number already has a row
    const existing = await sheetsFetch(
      `/values/${encodeURIComponent(`${SHEET_TAB}!A2:A`)}`,
      token
    );

    const rows: string[][] = existing.values || [];
    const rowIndex = rows.findIndex(
      (r) => String(r[0]) === String(invoice.invoiceNumber)
    );

    const rowValues = invoiceToRow(invoice, items);

    if (rowIndex === -1) {
      // 2a. Not found — append a new row
      await sheetsFetch(
        `/values/${encodeURIComponent(`${SHEET_TAB}!A:N`)}:append?valueInputOption=USER_ENTERED`,
        token,
        { method: "POST", body: JSON.stringify({ values: [rowValues] }) }
      );
    } else {
      // 2b. Found — overwrite that exact row (rowIndex is 0-based from A2)
      const sheetRowNumber = rowIndex + 2; // +2 because data starts at row 2
      await sheetsFetch(
        `/values/${encodeURIComponent(`${SHEET_TAB}!A${sheetRowNumber}:N${sheetRowNumber}`)}?valueInputOption=USER_ENTERED`,
        token,
        { method: "PUT", body: JSON.stringify({ values: [rowValues] }) }
      );
    }
  } catch (err) {
    // Never let a sheet sync failure break invoice creation/editing
    console.error("[googleSheets] sync failed:", err);
  }
}