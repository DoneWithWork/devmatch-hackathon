import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

const timestamps = {
    update_at: timestamp(),
    created_at: timestamp().defaultNow().notNull(),
    deleted_at: timestamp(),
}
export const roleEnum = pgEnum('role', ['admin', 'user', 'issuer'])
export const applicationStatus = pgEnum('applicationStatus', ['pending', 'success', 'rejected']);
export const institutionEnum = pgEnum('institution', ['university', 'college', 'school', 'online_center', 'gov_agency', 'research_institute', 'training_provider', 'non_profit'])
export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userAddress: text().unique().notNull(),
    email: varchar({ length: 255 }).unique().notNull(),
    username: varchar({ length: 255 }),
    isIssuer: boolean().default(false),
    role: roleEnum().default("user"),
    ...timestamps

});
export const issuerApplication = pgTable("application", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    applicant: integer("user_id").references(() => users.id),
    domain: text().notNull().unique(),
    institution: institutionEnum().default("university"),
    status: applicationStatus().default("pending"),
    reason: text(),
    ...timestamps
})
export const issuerDocuments = pgTable("documents", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    publicUrl: text().notNull(),
    key: text().notNull(),
    userId: integer("user_id").references(() => users.id).notNull(),
    issuerApplicationId: integer().references(() => issuerApplication.id),
    ...timestamps
})
export const issuers = pgTable("issuers", {
    id: uuid("id").primaryKey().defaultRandom(),
    issuerKey: text("issuer_key").unique().notNull(),
    name: text("name").notNull(),
    userId: integer("user_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const issuerDocumentsRelations = relations(issuerDocuments, ({ one }) => ({
    user: one(users, { fields: [issuerDocuments.userId], references: [users.id] }),
    issuerApplication: one(issuerApplication, { fields: [issuerDocuments.issuerApplicationId], references: [issuerApplication.id] })
}))
export const usersRelations = relations(users, ({ one, many }) => ({
    issuer: one(issuers),
    issuerDocuments: many(issuerDocuments)
}))
export const issuersRelations = relations(issuers, ({ one }) => ({
    user: one(users, { fields: [issuers.userId], references: [users.id] })
}))




// Certificate models
export const certificates = pgTable("certs", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").references(() => users.id).notNull(),
    title: text().notNull(),
    colour: varchar({ length: 100 }).default("#000000").notNull(),
    ...timestamps
})


export const individualCert = pgTable("single_cert", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    minted: boolean().default(false),
    email: text("user_email"),
    certificateId: integer("certificate_id").references(() => certificates.id, { onDelete: "no action" }).notNull(),
    imageUrl: text().notNull(),
    ...timestamps
})
export const certificateTemplates = pgTable("certificate_templates", {
    id: uuid("id").primaryKey().defaultRandom(),
    issuerId: uuid("issuer_id").references(() => issuers.id).notNull(),
    templateUrl: text("template_url").notNull(),
    metadata: jsonb("metadata"),
    ...timestamps
});

export const individualCertRelations = relations(individualCert, ({ one }) => ({
    mainCert: one(certificates, {
        fields: [individualCert.certificateId],
        references: [certificates.id],
    }),
}));
