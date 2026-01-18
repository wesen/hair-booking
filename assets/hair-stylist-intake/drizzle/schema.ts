import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Decision tree configurations stored as YAML DSL
 * Supports versioning and publish/unpublish workflow
 */
export const decisionTrees = mysqlTable("decision_trees", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  /** YAML DSL content defining the decision tree structure */
  dslContent: text("dsl_content").notNull(),
  /** Whether this tree is published and available to clients */
  isPublished: int("is_published").default(0).notNull(),
  /** Whether this is a preset template provided by the system */
  isPreset: int("is_preset").default(0).notNull(),
  version: int("version").default(1).notNull(),
  createdBy: int("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type DecisionTree = typeof decisionTrees.$inferSelect;
export type InsertDecisionTree = typeof decisionTrees.$inferInsert;

/**
 * Client service selections and bookings
 * Stores the path taken through a decision tree and final pricing
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  decisionTreeId: int("decision_tree_id").notNull().references(() => decisionTrees.id),
  /** User who made the booking (nullable for guest bookings) */
  userId: int("user_id").references(() => users.id),
  /** JSON array of selected service options with their node IDs */
  selectedServices: text("selected_services").notNull(),
  /** Final calculated price in cents */
  totalPrice: int("total_price").notNull(),
  /** Total duration in minutes */
  totalDuration: int("total_duration").notNull(),
  /** Applied combo pricing rules as JSON */
  appliedRules: text("applied_rules"),
  /** Client contact information */
  clientName: varchar("client_name", { length: 255 }),
  clientEmail: varchar("client_email", { length: 320 }),
  clientPhone: varchar("client_phone", { length: 50 }),
  /** Preferred appointment date/time as Unix timestamp */
  preferredDateTime: timestamp("preferred_datetime"),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;