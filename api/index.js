var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api-src/index.ts
import express from "express";
import { createServer } from "http";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertInvoiceItemSchema: () => insertInvoiceItemSchema,
  insertInvoiceRequestSchema: () => insertInvoiceRequestSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertQuoteSchema: () => insertQuoteSchema,
  invoiceItems: () => invoiceItems,
  invoiceRequests: () => invoiceRequests,
  invoices: () => invoices,
  quotes: () => quotes
});
import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: integer("invoice_number").notNull().unique(),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  currency: text("currency").notNull(),
  // USD, GBP, PKR, EUR
  // Company Details (Static as per requirements, but we store relevant per-invoice data if needed)
  // Requirements state: Show clearly on the invoice preview: Curve Tech Solution, etc.
  // Client Details
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  // Totals & Calcs
  subtotal: numeric("subtotal").notNull(),
  subtotalDiscountValue: numeric("subtotal_discount_value").default("0"),
  subtotalDiscountType: text("subtotal_discount_type"),
  // 'percentage', 'fixed'
  taxValue: numeric("tax_value").default("0"),
  taxType: text("tax_type"),
  // 'percentage', 'fixed'
  totalAmount: numeric("total_amount").notNull(),
  // Deposit Logic
  depositType: text("deposit_type"),
  // 'percentage', 'fixed'
  depositValue: numeric("deposit_value").default("0"),
  depositRequested: numeric("deposit_requested").default("0"),
  payableAfterDeposit: numeric("payable_after_deposit").default("0"),
  // Paid/Payable Logic
  paidAmount: numeric("paid_amount").default("0"),
  payableAmount: numeric("payable_amount").default("0"),
  description: text("description"),
  status: text("status").notNull().default("Unpaid"),
  createdAt: timestamp("created_at").defaultNow()
});
var invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  discountValue: numeric("discount_value").default("0"),
  discountType: text("discount_type"),
  // 'percentage', 'fixed'
  total: numeric("total").notNull()
});
var quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  amount: numeric("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var invoiceRequests = pgTable("invoice_requests", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").default(""),
  serviceName: text("service_name").notNull(),
  price: text("price").notNull(),
  message: text("message").default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
var insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true });
var insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });
var insertInvoiceRequestSchema = createInsertSchema(invoiceRequests).omit({ id: true, createdAt: true, status: true });

// server/db.ts
var { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { sql, eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  async getAllInvoices() {
    return await db.select().from(invoices).orderBy(desc(invoices.id));
  }
  async getInvoice(id) {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }
  async getInvoiceItems(invoiceId) {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }
  async deleteInvoice(id) {
    await db.transaction(async (tx) => {
      await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      await tx.delete(invoices).where(eq(invoices.id, id));
    });
  }
  async updateInvoice(id, invoiceUpdate, items) {
    return await db.transaction(async (tx) => {
      const { id: _, createdAt: __, ...updateData } = invoiceUpdate;
      const [updatedInvoice] = await tx.update(invoices).set(updateData).where(eq(invoices.id, id)).returning();
      if (items) {
        await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
        const itemsWithId = items.map((item) => {
          const { id: ___, invoiceId: ____, ...itemData } = item;
          return {
            ...itemData,
            invoiceId: id,
            price: String(itemData.price),
            discountValue: String(itemData.discountValue),
            total: String(itemData.total)
          };
        });
        if (itemsWithId.length > 0) {
          await tx.insert(invoiceItems).values(itemsWithId);
        }
      }
      return updatedInvoice;
    });
  }
  async getDashboardStats(month, year, selectedCurrency = "USD") {
    try {
      let allInvoices = await db.select().from(invoices);
      const allQuotes = await db.select().from(quotes);
      const rates = {
        "USD": 1,
        "PKR": 280,
        "EUR": 0.92,
        "GBP": 0.78
      };
      if (month !== void 0 && month !== -1 && year !== void 0) {
        allInvoices = allInvoices.filter((inv) => {
          const date = new Date(inv.issueDate);
          return date.getMonth() === month && date.getFullYear() === year;
        });
      }
      const convertToUSD = (amount, fromCurrency) => {
        if (fromCurrency === "USD") return amount;
        const rate = rates[fromCurrency] || 1;
        return amount / rate;
      };
      const convertFromUSD = (amountUSD, toCurrency) => {
        if (toCurrency === "USD") return amountUSD;
        const rate = rates[toCurrency] || 1;
        return amountUSD * rate;
      };
      const totalSales = allInvoices.reduce((sum, inv) => {
        const invoiceAmount = Number(inv.totalAmount || 0);
        const invoiceCurrency = inv.currency || "USD";
        const amountUSD = convertToUSD(invoiceAmount, invoiceCurrency);
        const convertedAmount = convertFromUSD(amountUSD, selectedCurrency);
        return sum + convertedAmount;
      }, 0);
      const totalReceivables = allInvoices.reduce((sum, inv) => {
        const receivableAmount = Number(inv.payableAmount || 0);
        const invoiceCurrency = inv.currency || "USD";
        const amountUSD = convertToUSD(receivableAmount, invoiceCurrency);
        const convertedAmount = convertFromUSD(amountUSD, selectedCurrency);
        return sum + convertedAmount;
      }, 0);
      return {
        totalSales,
        totalInvoices: allInvoices.length,
        totalReceivables,
        totalQuotes: allQuotes.length
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        totalSales: 0,
        totalInvoices: 0,
        totalReceivables: 0,
        totalQuotes: 0
      };
    }
  }
  async getNextInvoiceNumber() {
    try {
      const result = await db.select({ max: sql`max(${invoices.invoiceNumber})` }).from(invoices);
      const maxNum = result[0]?.max;
      if (maxNum === null || maxNum === void 0) {
        return 580;
      }
      return Number(maxNum) + 1;
    } catch (error) {
      console.error("Error getting next invoice number:", error);
      return 580;
    }
  }
  async createInvoice(insertInvoice, items) {
    return await db.transaction(async (tx) => {
      const [invoice] = await tx.insert(invoices).values(insertInvoice).returning();
      if (items && items.length > 0) {
        const itemsWithId = items.map((item) => ({
          ...item,
          invoiceId: invoice.id
        }));
        await tx.insert(invoiceItems).values(itemsWithId);
      }
      return invoice;
    });
  }
  async createQuote(insertQuote) {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    return quote;
  }
  async getInvoiceRequests(status) {
    const all = await db.select().from(invoiceRequests).orderBy(desc(invoiceRequests.createdAt));
    if (status) return all.filter((r) => r.status === status);
    return all;
  }
  async createInvoiceRequest(data) {
    const [req] = await db.insert(invoiceRequests).values(data).returning();
    return req;
  }
  async updateInvoiceRequestStatus(id, status) {
    const [updated] = await db.update(invoiceRequests).set({ status }).where(eq(invoiceRequests.id, id)).returning();
    return updated;
  }
};
var storage = new DatabaseStorage();

// shared/routes.ts
import { z } from "zod";
var api = {
  dashboard: {
    getStats: {
      method: "GET",
      path: "/api/stats",
      responses: {
        200: z.object({
          totalSales: z.number(),
          totalInvoices: z.number(),
          totalReceivables: z.number(),
          totalQuotes: z.number()
        })
      }
    }
  },
  invoices: {
    create: {
      method: "POST",
      path: "/api/invoices",
      input: z.object({
        invoice: insertInvoiceSchema.extend({
          issueDate: z.coerce.date(),
          dueDate: z.coerce.date()
        }),
        items: z.array(insertInvoiceItemSchema.omit({ invoiceId: true }))
      }),
      responses: {
        201: z.object({ id: z.number() })
      }
    },
    getNextNumber: {
      method: "GET",
      path: "/api/invoices/next-number",
      responses: {
        200: z.object({ nextNumber: z.number() })
      }
    }
  },
  quotes: {
    create: {
      method: "POST",
      path: "/api/quotes",
      input: insertQuoteSchema,
      responses: {
        201: z.object({ id: z.number() })
      }
    }
  }
};

// server/routes.ts
import { z as z2 } from "zod";

// server/googleSheets.ts
import { JWT } from "google-auth-library";
var SHEET_TAB = process.env.GOOGLE_SHEET_TAB || "Sheet1";
var SHEET_ID = process.env.GOOGLE_SHEET_ID;
var SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
var cachedClient = null;
function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !key) {
    console.warn(
      "[googleSheets] GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY not set \u2014 skipping sheet sync"
    );
    return null;
  }
  if (!cachedClient) {
    cachedClient = new JWT({
      email,
      key: key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
  }
  return cachedClient;
}
async function getAccessToken() {
  const client = getAuthClient();
  if (!client) return null;
  const token = await client.getAccessToken();
  return token?.token ?? null;
}
function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB");
}
function invoiceToRow(invoice, items) {
  const serviceNames = items && items.length > 0 ? items.map((i) => i.title).join(", ") : "";
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
    invoice.status
  ];
}
async function sheetsFetch(path, token, init2) {
  const res = await fetch(`${SHEETS_API}/${SHEET_ID}${path}`, {
    ...init2,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init2?.headers || {}
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sheets API ${res.status}: ${body}`);
  }
  return res.json();
}
async function debugSheetConnection() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  const report = {
    has_GOOGLE_SHEET_ID: !!SHEET_ID,
    has_GOOGLE_SERVICE_ACCOUNT_EMAIL: !!email,
    has_GOOGLE_PRIVATE_KEY: !!key,
    GOOGLE_SHEET_TAB: SHEET_TAB,
    service_account_email_preview: email ? email.slice(0, 6) + "..." + email.slice(-20) : null
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
    report.message = "\u2705 Connection works! Auth + Sheets API read succeeded.";
  } catch (err) {
    report.error = err?.message || String(err);
  }
  return report;
}
async function syncInvoiceToSheet(invoice, items) {
  try {
    if (!SHEET_ID) return;
    const token = await getAccessToken();
    if (!token) return;
    const existing = await sheetsFetch(
      `/values/${encodeURIComponent(`${SHEET_TAB}!A2:A`)}`,
      token
    );
    const rows = existing.values || [];
    const rowIndex = rows.findIndex(
      (r) => String(r[0]) === String(invoice.invoiceNumber)
    );
    const rowValues = invoiceToRow(invoice, items);
    if (rowIndex === -1) {
      await sheetsFetch(
        `/values/${encodeURIComponent(`${SHEET_TAB}!A:N`)}:append?valueInputOption=USER_ENTERED`,
        token,
        { method: "POST", body: JSON.stringify({ values: [rowValues] }) }
      );
    } else {
      const sheetRowNumber = rowIndex + 2;
      await sheetsFetch(
        `/values/${encodeURIComponent(`${SHEET_TAB}!A${sheetRowNumber}:N${sheetRowNumber}`)}?valueInputOption=USER_ENTERED`,
        token,
        { method: "PUT", body: JSON.stringify({ values: [rowValues] }) }
      );
    }
  } catch (err) {
    console.error("[googleSheets] sync failed:", err);
  }
}

// server/routes.ts
async function registerRoutes(httpServer2, app2) {
  app2.get("/api/debug-sheets", async (req, res) => {
    const report = await debugSheetConnection();
    res.json(report);
  });
  app2.get(api.dashboard.getStats.path, async (req, res) => {
    const month = req.query.month ? parseInt(req.query.month) : void 0;
    const year = req.query.year ? parseInt(req.query.year) : void 0;
    const currency = req.query.currency;
    const stats = await storage.getDashboardStats(month, year, currency);
    res.json(stats);
  });
  app2.get(api.invoices.getNextNumber.path, async (req, res) => {
    const nextNumber = await storage.getNextInvoiceNumber();
    res.json({ nextNumber });
  });
  app2.get("/api/invoices", async (req, res) => {
    const invoices2 = await storage.getAllInvoices();
    res.json(invoices2);
  });
  app2.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      const items = await storage.getInvoiceItems(id);
      res.json({ invoice, items });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post(api.invoices.create.path, async (req, res) => {
    try {
      const input = api.invoices.create.input.parse(req.body);
      const invoice = await storage.createInvoice(input.invoice, input.items);
      await syncInvoiceToSheet(invoice, input.items);
      res.status(201).json(invoice);
    } catch (err) {
      console.error("Error creating invoice:", err);
      if (err instanceof z2.ZodError) {
        return res.status(400).json({
          message: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          errors: err.errors
        });
      }
      const pgErr = err;
      if (pgErr?.code === "23505") {
        return res.status(409).json({ message: "Invoice number already exists. Please try again." });
      }
      res.status(500).json({ message: String(err) });
    }
  });
  app2.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInvoice(id);
      res.sendStatus(204);
    } catch (err) {
      console.error("Error deleting invoice:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { invoice, items } = req.body;
      if (invoice) {
        const numericFields = ["subtotal", "totalAmount", "paidAmount", "payableAmount", "depositValue", "depositRequested", "payableAfterDeposit", "taxValue", "subtotalDiscountValue"];
        numericFields.forEach((field) => {
          if (invoice[field] !== void 0) {
            invoice[field] = String(invoice[field]);
          }
        });
      }
      if (items && Array.isArray(items)) {
        items.forEach((item) => {
          const itemNumericFields = ["price", "discountValue", "total"];
          itemNumericFields.forEach((field) => {
            if (item[field] !== void 0) {
              item[field] = String(item[field]);
            }
          });
        });
      }
      const invoiceData = insertInvoiceSchema.partial().parse(invoice);
      const itemsData = items ? z2.array(insertInvoiceItemSchema.omit({ invoiceId: true })).parse(items) : void 0;
      const updatedInvoice = await storage.updateInvoice(id, invoiceData, itemsData);
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found or no changes made" });
      }
      const finalItems = itemsData ?? await storage.getInvoiceItems(id);
      await syncInvoiceToSheet(updatedInvoice, finalItems);
      res.json(updatedInvoice);
    } catch (err) {
      console.error("Error updating invoice:", err);
      if (err instanceof z2.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/invoice-requests", async (req, res) => {
    try {
      const status = req.query.status;
      const requests = await storage.getInvoiceRequests(status);
      res.json(requests);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/invoice-requests", async (req, res) => {
    try {
      const b = req.body;
      const normalized = {
        clientName: b.clientName || b.client_name || b.name || b.fullName || b.full_name || "",
        clientEmail: b.clientEmail || b.client_email || b.email || "",
        clientPhone: b.clientPhone || b.client_phone || b.phone || b.mobile || b.contact || "",
        serviceName: b.serviceName || b.service_name || b.service || b.package || b.subject || b.title || "",
        price: String(b.price || b.budget || b.amount || b.cost || ""),
        message: b.message || b.description || b.notes || b.details || b.note || ""
      };
      const data = insertInvoiceRequestSchema.parse(normalized);
      const request = await storage.createInvoiceRequest(data);
      res.status(201).json(request);
    } catch (err) {
      if (err instanceof z2.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, errors: err.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/invoice-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!["pending", "accepted", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await storage.updateInvoiceRequestStatus(id, status);
      if (status === "accepted") {
        try {
          const nextNumber = await storage.getNextInvoiceNumber();
          let priceNum = parseFloat((updated.price || "0").replace(/[^0-9]/g, "")) || 0;
          const invoiceData = {
            invoiceNumber: nextNumber,
            issueDate: /* @__PURE__ */ new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
            currency: "PKR",
            clientName: updated.clientName,
            clientEmail: updated.clientEmail,
            clientPhone: updated.clientPhone || "",
            subtotal: String(priceNum),
            subtotalDiscountValue: "0",
            subtotalDiscountType: "fixed",
            taxValue: "0",
            taxType: "fixed",
            totalAmount: String(priceNum),
            depositType: "fixed",
            depositValue: "0",
            depositRequested: "0",
            payableAfterDeposit: String(priceNum),
            paidAmount: "0",
            payableAmount: String(priceNum),
            description: updated.message || "",
            status: "Unpaid"
          };
          const items = [{
            title: updated.serviceName,
            description: updated.message || "",
            price: String(priceNum),
            discountValue: "0",
            discountType: "fixed",
            total: String(priceNum)
          }];
          const newInvoice = await storage.createInvoice(invoiceData, items);
          await syncInvoiceToSheet(newInvoice, items);
          return res.json({ ...updated, generatedInvoiceId: newInvoice.id });
        } catch (invoiceErr) {
          console.error("Auto-invoice generation failed:", invoiceErr);
          return res.json(updated);
        }
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post(api.quotes.create.path, async (req, res) => {
    try {
      const input = api.quotes.create.input.parse(req.body);
      const quote = await storage.createQuote(input);
      res.status(201).json(quote);
    } catch (err) {
      if (err instanceof z2.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  return httpServer2;
}

// api-src/index.ts
var app = express();
var httpServer = createServer(app);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://package.curvetechsolution.online");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var initialized = null;
async function init() {
  if (!initialized) {
    initialized = registerRoutes(httpServer, app).then(() => void 0);
  }
  return initialized;
}
async function handler(req, res) {
  await init();
  app(req, res);
}
export {
  handler as default
};
