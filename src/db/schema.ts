import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  update_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
  deleted_at: timestamp(),
};
export const roleEnum = pgEnum("role", ["admin", "user", "issuer"]);
export const applicationStatus = pgEnum("applicationStatus", [
  "pending",
  "success",
  "rejected",
]);
export const institutionEnum = pgEnum("institution", [
  "university",
  "college",
  "school",
  "online_center",
  "gov_agency",
  "research_institute",
  "training_provider",
  "non_profie",
]);
export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userAddress: text().unique().notNull(),
  email: varchar({ length: 255 }).unique(),
  username: varchar({ length: 255 }),
  isIssuer: boolean().default(false),
  role: roleEnum().default("user"),
  ...timestamps,
});
export const issuerDocuments = pgTable("documents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  publicUrl: text().notNull(),
  key: text().notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  issuerApplicationId: integer().references(() => issuerApplication.id),
});
export const issuers = pgTable("issuers", {
  id: uuid("id").primaryKey().defaultRandom(),
  issuerKey: text("issuer_key").unique().notNull(),
  name: text("name").notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const issuerDocumentsRelations = relations(
  issuerDocuments,
  ({ one }) => ({
    user: one(users, {
      fields: [issuerDocuments.userId],
      references: [users.id],
    }),
    issuerApplication: one(issuerApplication, {
      fields: [issuerDocuments.issuerApplicationId],
      references: [issuerApplication.id],
    }),
  })
);
export const usersRelations = relations(users, ({ one, many }) => ({
  issuer: one(issuers),
  issuerDocuments: many(issuerDocuments),
}));
export const issuersRelations = relations(issuers, ({ one }) => ({
  user: one(users, { fields: [issuers.userId], references: [users.id] }),
}));

export const issuerApplication = pgTable("application", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  applicant: integer("user_id").references(() => users.id),
  organizationName: text().notNull(), // Store the actual organization name
  domain: text().notNull().unique(), // Store the domain/slug version
  institution: institutionEnum().default("university"),
  description: text(), // Add description field
  website: text(), // Add website field
  issuerCapId: text(), // Store the IssuerCap object ID from blockchain
  transactionDigest: text(), // Store the transaction digest from application
  status: applicationStatus().default("pending"),
  ...timestamps, // Add timestamps
});

// Certificate models
export const certificates = pgTable("certs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
});

export const individualCert = pgTable("single_cert", {
  minted: boolean().default(false),
});
export const certificateTemplates = pgTable("certificate_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  issuerId: uuid("issuer_id")
    .references(() => issuers.id)
    .notNull(),
  templateUrl: text("template_url").notNull(),
  metadata: jsonb("metadata"),
  ...timestamps,
});
