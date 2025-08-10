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
  update_at: timestamp("update_at", { mode: "date" }),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { mode: "date" }),
};

export const roleEnum = pgEnum("role", ["admin", "user", "issuer"]);

export const applicationStatus = pgEnum("applicationStatus", [
  "pending",
  "success", // Keep existing value to avoid breaking
  "approved", // Add new value
  "rejected",
  "under_review",
]);

export const transactionTypeEnum = pgEnum("transactionType", [
  "gas_transfer",
  "template_creation",
  "certificate_issuance",
  "certificate_mint",
  "issuer_approval",
  "admin_operation",
  "fee_payment",
]);

export const transactionStatusEnum = pgEnum("transactionStatus", [
  "pending",
  "success",
  "failed",
  "cancelled",
  "expired",
]);

export const certificateStatusEnum = pgEnum("certificateStatus", [
  "draft",
  "issued",
  "minted",
  "revoked",
  "expired",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // Change to UUID
  userAddress: text("user_address").unique().notNull(), // Blockchain wallet address
  email: varchar({ length: 255 }).unique(),
  username: varchar({ length: 100 }),
  displayName: text("display_name"), // User's preferred display name
  profileImage: text("profile_image"), // Profile image URL
  role: roleEnum().default("user"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at", { mode: "date" }),
  emailVerified: boolean("email_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at", { mode: "date" }),
  ...timestamps,
});
export const issuerDocuments = pgTable("documents", {
  // Keep original table name
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  publicUrl: text("public_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"), // File size in bytes
  mimeType: text("mime_type"), // File MIME type
  key: text().notNull(), // Storage key/path
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  issuerApplicationId: integer("issuer_application_id").references(
    () => issuerApplication.id,
    { onDelete: "cascade" }
  ),
  documentType: text("document_type"), // e.g., "identity", "certification", "address_proof"
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at", { mode: "date" }),
  verifiedBy: uuid("verified_by").references(() => users.id), // Admin who verified
  ...timestamps,
});

export const issuers = pgTable("issuers", {
  id: uuid("id").primaryKey().defaultRandom(),
  issuerKey: text("issuer_key").unique().notNull(),
  name: text("name").notNull(),
  displayName: text("display_name"), // Public display name
  bio: text("bio"), // Short bio or description
  website: text("website"), // Official website
  logo: text("logo"), // Logo image URL
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at", { mode: "date" }),
  lastActivityAt: timestamp("last_activity_at", { mode: "date" }),
  totalCertificatesIssued: integer("total_certificates_issued").default(0),
  ...timestamps,
});

export const issuerApplication = pgTable("application", {
  // Keep original table name
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  applicant: uuid("applicant_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  organizationName: text("organization_name").notNull(),
  domain: text("domain").notNull().unique(), // URL-friendly slug
  organization: text("organization"), // Organization type (university, company, etc.)
  description: text("description"), // Remove .notNull() for now
  website: text("website"), // Official website URL
  contactEmail: text("contact_email"), // Remove .notNull() for now
  contactPhone: text("contact_phone"), // Contact phone number
  address: jsonb("address"), // Full address object
  country: text("country"), // Remove .notNull() for now
  timezone: text("timezone"), // Organization timezone
  transactionDigest: text("transaction_digest"), // Blockchain transaction reference
  blockchainAddress: text("blockchain_address"), // Associated blockchain address
  status: applicationStatus().default("pending"),
  submittedAt: timestamp("submitted_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  reviewedBy: uuid("reviewed_by").references(() => users.id), // Admin who reviewed
  approvedAt: timestamp("approved_at", { mode: "date" }),
  rejectedAt: timestamp("rejected_at", { mode: "date" }),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"), // Internal admin notes
  ...timestamps,
});

// Certificate models - Templates first (referenced by certificates)
export const certificateTemplates = pgTable("certificate_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  issuerId: uuid("issuer_id")
    .references(() => issuers.id, { onDelete: "cascade" })
    .notNull(),
  templateUrl: text("template_url").notNull(),
  templateName: text("template_name").notNull(),
  description: text("description"),
  category: text("category"), // e.g., "education", "professional", "achievement"
  tags: jsonb("tags"), // Array of tags for searchability
  fields: jsonb("fields"), // Define required fields for this template
  design: jsonb("design"), // Design configuration (colors, layout, etc.)
  metadata: jsonb("metadata"), // Additional template configuration
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(false), // Whether template is publicly visible
  usageCount: integer("usage_count").default(0), // Track how many certificates use this
  version: integer("version").default(1), // Template versioning
  ...timestamps,
});

export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").references(() => certificateTemplates.id),
  issuerId: uuid("issuer_id")
    .references(() => issuers.id, { onDelete: "cascade" })
    .notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientEmail: text("recipient_email"),
  recipientWallet: text("recipient_wallet"), // Blockchain wallet address
  recipientId: text("recipient_id"), // Internal recipient identifier
  certificateData: jsonb("certificate_data").notNull(), // Achievement, course details, grades, etc.
  certificateHash: text("certificate_hash"), // Hash of certificate content for integrity
  transactionDigest: text("transaction_digest"), // Blockchain transaction reference
  blockchainId: text("blockchain_id"), // NFT/Certificate ID on blockchain
  clientProvidedId: text("client_provided_id"), // Deterministic linkage ID sent to chain
  ipfsHash: text("ipfs_hash"), // IPFS storage hash
  status: certificateStatusEnum().default("draft"),
  issuedAt: timestamp("issued_at", { mode: "date" }),
  publishedAt: timestamp("published_at", { mode: "date" }), // When made publicly available
  expiresAt: timestamp("expires_at", { mode: "date" }), // Optional expiration date
  revokedAt: timestamp("revoked_at", { mode: "date" }),
  revokedBy: uuid("revoked_by").references(() => users.id), // Fix: use uuid type
  revocationReason: text("revocation_reason"),
  isPublic: boolean("is_public").default(false), // Whether publicly verifiable
  ...timestamps,
});

export const individualCert = pgTable("individual_certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  certificateId: uuid("certificate_id")
    .references(() => certificates.id, { onDelete: "cascade" })
    .notNull(),
  verificationCode: text("verification_code").unique().notNull(), // Unique verification code
  qrCodeUrl: text("qr_code_url"), // Generated QR code image URL

  // Minting information
  minted: boolean().default(false),
  mintedAt: timestamp("minted_at", { mode: "date" }),
  transactionHash: text("transaction_hash"), // Keep original column name
  mintingTransactionHash: text("minting_transaction_hash"), // New separate column
  tokenId: text("token_id"), // NFT token ID if minted as NFT
  contractAddress: text("contract_address"), // Smart contract address

  // Storage information
  ipfsHash: text("ipfs_hash"), // IPFS hash for decentralized storage
  storageUrl: text("storage_url"), // Direct storage URL
  backupStorageUrls: jsonb("backup_storage_urls"), // Backup storage locations

  // Access tracking
  downloadCount: integer("download_count").default(0),
  viewCount: integer("view_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at", { mode: "date" }),
  lastAccessedBy: text("last_accessed_by"), // IP or identifier of last accessor

  // Security
  accessRestricted: boolean("access_restricted").default(false),
  accessPassword: text("access_password"), // Optional password protection
  allowedAccessors: jsonb("allowed_accessors"), // List of allowed wallet addresses

  // Metadata
  certificateFormat: text("certificate_format").default("pdf"), // pdf, image, etc.
  fileSize: integer("file_size"), // File size in bytes
  checksumHash: text("checksum_hash"), // File integrity hash

  ...timestamps,
});

// Transaction tracking tables
export const transactions = pgTable("transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  transactionHash: text("transaction_hash").unique(),
  transactionType: transactionTypeEnum().notNull(),
  status: transactionStatusEnum().default("pending"),

  // Addresses and amounts - Make nullable to handle existing data
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  amount: text("amount"), // Store as string to handle large numbers (in MIST)
  amountInSui: text("amount_in_sui"), // Human-readable amount in SUI

  // Gas information
  gasLimit: text("gas_limit"),
  gasUsed: text("gas_used"),
  gasFee: text("gas_fee"), // Total gas fee in MIST
  gasFeeInSui: text("gas_fee_in_sui"), // Gas fee in SUI
  gasPrice: text("gas_price"), // Gas price in MIST

  // Transaction details
  blockNumber: text("block_number"),
  blockHash: text("block_hash"),
  transactionIndex: integer("transaction_index"),
  nonce: integer("nonce"),

  // Metadata
  description: text("description"),
  metadata: jsonb("metadata"), // Store additional transaction details
  internalReference: text("internal_reference"), // Internal tracking reference

  // Relations
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  issuerApplicationId: integer("issuer_application_id").references(
    () => issuerApplication.id,
    { onDelete: "set null" }
  ),
  certificateId: uuid("certificate_id").references(() => certificates.id, {
    onDelete: "set null",
  }),

  // Timestamps
  initiatedAt: timestamp("initiated_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  completedAt: timestamp("completed_at", { mode: "date" }),
  failedAt: timestamp("failed_at", { mode: "date" }),

  ...timestamps,
});

export const gasBalanceHistory = pgTable("gas_balance_history", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: text("address").notNull(),
  balance: text("balance").notNull(), // Balance in MIST
  balanceInSui: text("balance_in_sui"), // Balance in SUI for readability - make nullable
  previousBalance: text("previous_balance"), // Previous balance in MIST
  change: text("change"), // Change amount in MIST
  changeInSui: text("change_in_sui"), // Change amount in SUI
  changeType: text("change_type"), // "increase", "decrease"
  reason: text("reason"), // Reason for balance change
  transactionId: integer("transaction_id").references(() => transactions.id, {
    onDelete: "set null",
  }),

  // Metadata
  blockNumber: text("block_number"),
  metadata: jsonb("metadata"),

  ...timestamps,
});

// Audit and activity tracking
export const auditLogs = pgTable("audit_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  tableName: text("table_name").notNull(), // Which table was affected
  recordId: text("record_id").notNull(), // ID of the affected record
  action: text("action").notNull(), // CREATE, UPDATE, DELETE
  oldValues: jsonb("old_values"), // Previous values (for updates/deletes)
  newValues: jsonb("new_values"), // New values (for creates/updates)
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"), // Backup in case user is deleted
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
});

// System notifications
export const notifications = pgTable("notifications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(), // "certificate_issued", "application_approved", etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional notification data
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at", { mode: "date" }),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  priority: text("priority").default("normal"), // "low", "normal", "high", "urgent"
  ...timestamps,
});

// System settings and configuration
export const systemSettings = pgTable("system_settings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: text("key").unique().notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  category: text("category"), // "blockchain", "email", "storage", etc.
  isPublic: boolean("is_public").default(false), // Whether setting is publicly readable
  ...timestamps,
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  issuer: one(issuers, { fields: [users.id], references: [issuers.userId] }),
  issuerDocuments: many(issuerDocuments),
  issuerApplications: many(issuerApplication),
  transactions: many(transactions),
  auditLogs: many(auditLogs),
  notifications: many(notifications),
}));

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
    verifiedBy: one(users, {
      fields: [issuerDocuments.verifiedBy],
      references: [users.id],
    }),
  })
);

export const issuersRelations = relations(issuers, ({ one, many }) => ({
  user: one(users, { fields: [issuers.userId], references: [users.id] }),
  certificateTemplates: many(certificateTemplates),
  certificates: many(certificates),
}));

export const issuerApplicationRelations = relations(
  issuerApplication,
  ({ one, many }) => ({
    applicant: one(users, {
      fields: [issuerApplication.applicant],
      references: [users.id],
    }),
    reviewedBy: one(users, {
      fields: [issuerApplication.reviewedBy],
      references: [users.id],
    }),
    documents: many(issuerDocuments),
    transactions: many(transactions),
  })
);

export const certificateTemplatesRelations = relations(
  certificateTemplates,
  ({ one, many }) => ({
    issuer: one(issuers, {
      fields: [certificateTemplates.issuerId],
      references: [issuers.id],
    }),
    certificates: many(certificates),
  })
);

export const certificatesRelations = relations(
  certificates,
  ({ one, many }) => ({
    template: one(certificateTemplates, {
      fields: [certificates.templateId],
      references: [certificateTemplates.id],
    }),
    issuer: one(issuers, {
      fields: [certificates.issuerId],
      references: [issuers.id],
    }),
    revokedBy: one(users, {
      fields: [certificates.revokedBy],
      references: [users.id],
    }),
    individualCert: one(individualCert, {
      fields: [certificates.id],
      references: [individualCert.certificateId],
    }),
    transactions: many(transactions),
  })
);

export const individualCertRelations = relations(individualCert, ({ one }) => ({
  certificate: one(certificates, {
    fields: [individualCert.certificateId],
    references: [certificates.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  issuerApplication: one(issuerApplication, {
    fields: [transactions.issuerApplicationId],
    references: [issuerApplication.id],
  }),
  certificate: one(certificates, {
    fields: [transactions.certificateId],
    references: [certificates.id],
  }),
  gasBalanceHistory: one(gasBalanceHistory, {
    fields: [transactions.id],
    references: [gasBalanceHistory.transactionId],
  }),
}));

export const gasBalanceHistoryRelations = relations(
  gasBalanceHistory,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [gasBalanceHistory.transactionId],
      references: [transactions.id],
    }),
  })
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
