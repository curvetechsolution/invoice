import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Company settings table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logo: text("logo"), // base64 or file path
  bankAccountInfo: text("bank_account_info"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  clientId: varchar("client_id").references(() => clients.id),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  currency: text("currency").notNull(), // PKR, USD, EURO, GBP
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  grandTotal: decimal("grand_total", { precision: 12, scale: 2 }).notNull(),
  depositPercentage: decimal("deposit_percentage", { precision: 5, scale: 2 }).default("0"),
  depositAmount: decimal("deposit_amount", { precision: 12, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
  remainingBalance: decimal("remaining_balance", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  status: text("status").default("unpaid"), // paid, unpaid, partial
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Invoice items/project rows table
export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1),
  discountType: text("discount_type").default("none"), // none, fixed, percentage
  discountValue: decimal("discount_value", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

// Additional types for frontend
export type InvoiceWithItems = Invoice & {
  items: InvoiceItem[];
  client?: Client;
};

export type Currency = "PKR" | "USD" | "EURO" | "GBP";

export const currencySymbols: Record<Currency, string> = {
  PKR: "Rs",
  USD: "$",
  EURO: "€",
  GBP: "£",
};