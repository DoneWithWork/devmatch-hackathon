import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

const timestamps = {
    update_at: timestamp(),
    created_at: timestamp().defaultNow().notNull(),
    deleted_at: timestamp(),
}
export const roleEnum = pgEnum('role', ['admin', 'user', 'issuer'])
export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userAddress: text().unique().notNull(),
    email: varchar({ length: 255 }).unique(),
    username: varchar({ length: 255 }),
    isIssuer: boolean().default(false),
    role: roleEnum().default("user"),
    ...timestamps

});

export const issuers = pgTable("issuers", {
    id: uuid("id").primaryKey().defaultRandom(),
    issuerKey: text("issuer_key").unique().notNull(), // blockchain address
    name: text("name").notNull(),
    userId: integer("user_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
    issuer: one(issuers)
}))
export const issuersRelations = relations(issuers, ({ one }) => ({
    user: one(users, { fields: [issuers.userId], references: [users.id] })
}))


export const issuerApplication = pgTable("application", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").references(() => users.id)
})



// Certificate models
export const certificates = pgTable("certs", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

})


export const individualCert = pgTable("single_cert", {
    minted: boolean().default(false)

})
export const certificateTemplates = pgTable("certificate_templates", {
    id: uuid("id").primaryKey().defaultRandom(),
    issuerId: uuid("issuer_id").references(() => issuers.id).notNull(),
    templateUrl: text("template_url").notNull(),
    metadata: jsonb("metadata"),
    ...timestamps
});

