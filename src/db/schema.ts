import { pgTable, text, boolean, timestamp, date, numeric, uuid, pgEnum, index } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "technician", "client"]);
export const serviceTypeEnum = pgEnum("service_type", [
  "montaz",
  "przeglad",
  "naprawa",
  "uzupelnienie_czynnika",
]);
export const visitStatusEnum = pgEnum("visit_status", ["scheduled", "completed", "cancelled"]);

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Better Auth-owned tables (id/session/account/verification core fields follow
// Better Auth's default schema; role/tenantId/etc. below are additionalFields).
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  role: roleEnum("role").notNull(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  certNumber: text("cert_number"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  address: text("address").notNull(),
  clientNumber: text("client_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const devices = pgTable("devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
  model: text("model").notNull(),
  category: text("category").notNull(),
  installedAt: date("installed_at").notNull(),
  warrantyUntil: date("warranty_until"),
  warrantyActive: boolean("warranty_active").notNull().default(false),
  croNumber: text("cro_number"),
  refrigerant: text("refrigerant"),
  location: text("location"),
  // Denormalized on purpose, updated transactionally when a "przeglad" visit
  // closes — powers ReviewStatus computation without a correlated subquery.
  lastReviewAt: date("last_review_at"),
  nextReviewDue: date("next_review_due"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visits = pgTable("visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
  deviceId: uuid("device_id")
    .notNull()
    .references(() => devices.id),
  technicianId: text("technician_id")
    .notNull()
    .references(() => users.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  plannedType: serviceTypeEnum("planned_type").notNull(),
  lastVisitNote: text("last_visit_note"),
  croNumber: text("cro_number"),
  status: visitStatusEnum("status").notNull().default("scheduled"),
  closedAt: timestamp("closed_at"),
  refrigerantKg: numeric("refrigerant_kg", { precision: 6, scale: 2 }),
  closeNote: text("close_note"),
  photoBefore: boolean("photo_before").notNull().default(false),
  photoAfter: boolean("photo_after").notNull().default(false),
  signed: boolean("signed").notNull().default(false),
  croRequired: boolean("cro_required").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceEntries = pgTable("service_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  deviceId: uuid("device_id")
    .notNull()
    .references(() => devices.id),
  visitId: uuid("visit_id").references(() => visits.id),
  date: date("date").notNull(),
  type: serviceTypeEnum("type").notNull(),
  description: text("description").notNull(),
  technicianId: text("technician_id").references(() => users.id),
  protocolUrl: text("protocol_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
