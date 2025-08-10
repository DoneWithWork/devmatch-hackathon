import {
  pgTable,
  foreignKey,
  uuid,
  text,
  jsonb,
  timestamp,
  boolean,
  integer,
  unique,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const applicationStatus = pgEnum("applicationStatus", [
  "pending",
  "success",
  "approved",
  "rejected",
  "under_review",
]);
export const certificateStatus = pgEnum("certificateStatus", [
  "draft",
  "issued",
  "minted",
  "revoked",
  "expired",
]);
export const role = pgEnum("role", ["admin", "user", "issuer"]);
export const transactionStatus = pgEnum("transactionStatus", [
  "pending",
  "success",
  "failed",
  "cancelled",
  "expired",
]);
export const transactionType = pgEnum("transactionType", [
  "gas_transfer",
  "template_creation",
  "certificate_issuance",
  "certificate_mint",
  "issuer_approval",
  "admin_operation",
  "fee_payment",
]);

export const certificateTemplates = pgTable(
  "certificate_templates",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    issuerId: uuid("issuer_id").notNull(),
    templateUrl: text("template_url").notNull(),
    metadata: jsonb(),
    updateAt: timestamp("update_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    templateName: text("template_name").notNull(),
    description: text(),
    isActive: boolean("is_active").default(true),
    category: text(),
    tags: jsonb(),
    fields: jsonb(),
    design: jsonb(),
    isPublic: boolean("is_public").default(false),
    usageCount: integer("usage_count").default(0),
    version: integer().default(1),
  },
  (table) => [
    foreignKey({
      columns: [table.issuerId],
      foreignColumns: [issuers.id],
      name: "certificate_templates_issuer_id_issuers_id_fk",
    }).onDelete("cascade"),
  ]
);

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "users_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    email: varchar({ length: 255 }),
    username: varchar({ length: 100 }),
    isIssuer: boolean("is_issuer").default(false),
    role: role().default("user"),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    userAddress: text("user_address").notNull(),
    updateAt: timestamp("update_at", { mode: "string" }),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    displayName: text("display_name"),
    profileImage: text("profile_image"),
    isActive: boolean("is_active").default(true),
    lastLoginAt: timestamp("last_login_at", { mode: "string" }),
    emailVerified: boolean("email_verified").default(false),
    emailVerifiedAt: timestamp("email_verified_at", { mode: "string" }),
  },
  (table) => [unique("users_email_unique").on(table.email)]
);

export const issuers = pgTable(
  "issuers",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    issuerKey: text("issuer_key").notNull(),
    name: text().notNull(),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    displayName: text("display_name"),
    bio: text(),
    website: text(),
    logo: text(),
    isActive: boolean("is_active").default(true),
    isVerified: boolean("is_verified").default(false),
    verifiedAt: timestamp("verified_at", { mode: "string" }),
    lastActivityAt: timestamp("last_activity_at", { mode: "string" }),
    totalCertificatesIssued: integer("total_certificates_issued").default(0),
    updateAt: timestamp("update_at", { mode: "string" }),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "issuers_user_id_users_id_fk",
    }).onDelete("cascade"),
    unique("issuers_issuer_key_unique").on(table.issuerKey),
  ]
);

export const application = pgTable(
  "application",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "application_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    applicantId: integer("applicant_id").notNull(),
    domain: text().notNull(),
    organization: text(),
    status: applicationStatus().default("pending"),
    description: text(),
    website: text(),
    updateAt: timestamp("update_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    organizationName: text("organization_name").notNull(),
    transactionDigest: text("transaction_digest"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    address: jsonb(),
    country: text(),
    timezone: text(),
    blockchainAddress: text("blockchain_address"),
    submittedAt: timestamp("submitted_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    reviewedAt: timestamp("reviewed_at", { mode: "string" }),
    reviewedBy: integer("reviewed_by"),
    approvedAt: timestamp("approved_at", { mode: "string" }),
    rejectedAt: timestamp("rejected_at", { mode: "string" }),
    rejectionReason: text("rejection_reason"),
    notes: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.applicantId],
      foreignColumns: [users.id],
      name: "application_applicant_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.reviewedBy],
      foreignColumns: [users.id],
      name: "application_reviewed_by_users_id_fk",
    }),
    unique("application_domain_unique").on(table.domain),
  ]
);

export const documents = pgTable(
  "documents",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "documents_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    publicUrl: text("public_url").notNull(),
    key: text().notNull(),
    issuerApplicationId: integer("issuer_application_id"),
    userId: integer("user_id").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size"),
    mimeType: text("mime_type"),
    documentType: text("document_type"),
    isVerified: boolean("is_verified").default(false),
    verifiedAt: timestamp("verified_at", { mode: "string" }),
    verifiedBy: integer("verified_by"),
    updateAt: timestamp("update_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "documents_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.issuerApplicationId],
      foreignColumns: [application.id],
      name: "documents_issuer_application_id_application_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.verifiedBy],
      foreignColumns: [users.id],
      name: "documents_verified_by_users_id_fk",
    }),
  ]
);

export const individualCertificates = pgTable(
  "individual_certificates",
  {
    minted: boolean().default(false),
    id: uuid().defaultRandom().primaryKey().notNull(),
    certificateId: uuid("certificate_id").notNull(),
    mintedAt: timestamp("minted_at", { mode: "string" }),
    transactionHash: text("transaction_hash"),
    tokenId: text("token_id"),
    ipfsHash: text("ipfs_hash"),
    verificationCode: text("verification_code").notNull(),
    downloadCount: integer("download_count").default(0),
    lastAccessedAt: timestamp("last_accessed_at", { mode: "string" }),
    updateAt: timestamp("update_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    qrCodeUrl: text("qr_code_url"),
    mintingTransactionHash: text("minting_transaction_hash"),
    contractAddress: text("contract_address"),
    storageUrl: text("storage_url"),
    backupStorageUrls: jsonb("backup_storage_urls"),
    viewCount: integer("view_count").default(0),
    lastAccessedBy: text("last_accessed_by"),
    accessRestricted: boolean("access_restricted").default(false),
    accessPassword: text("access_password"),
    allowedAccessors: jsonb("allowed_accessors"),
    certificateFormat: text("certificate_format").default("pdf"),
    fileSize: integer("file_size"),
    checksumHash: text("checksum_hash"),
  },
  (table) => [
    foreignKey({
      columns: [table.certificateId],
      foreignColumns: [certificates.id],
      name: "individual_certificates_certificate_id_certificates_id_fk",
    }).onDelete("cascade"),
    unique("individual_certificates_verification_code_unique").on(
      table.verificationCode
    ),
  ]
);

export const gasBalanceHistory = pgTable(
  "gas_balance_history",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "gas_balance_history_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    address: text().notNull(),
    balance: text().notNull(),
    balanceInSui: text("balance_in_sui"),
    transactionId: integer("transaction_id"),
    updateAt: timestamp("update_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    previousBalance: text("previous_balance"),
    change: text(),
    changeInSui: text("change_in_sui"),
    changeType: text("change_type"),
    reason: text(),
    blockNumber: text("block_number"),
    metadata: jsonb(),
  },
  (table) => [
    foreignKey({
      columns: [table.transactionId],
      foreignColumns: [transactions.id],
      name: "gas_balance_history_transaction_id_transactions_id_fk",
    }).onDelete("set null"),
  ]
);

export const transactions = pgTable(
  "transactions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "transactions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    transactionHash: text("transaction_hash"),
    transactionType: transactionType().notNull(),
    status: transactionStatus().default("pending"),
    fromAddress: text("from_address"),
    toAddress: text("to_address"),
    amount: text(),
    gasUsed: text("gas_used"),
    gasFee: text("gas_fee"),
    description: text(),
    metadata: jsonb(),
    userId: integer("user_id"),
    issuerApplicationId: integer("issuer_application_id"),
    updateAt: timestamp("update_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    amountInSui: text("amount_in_sui"),
    gasLimit: text("gas_limit"),
    gasFeeInSui: text("gas_fee_in_sui"),
    gasPrice: text("gas_price"),
    blockNumber: text("block_number"),
    blockHash: text("block_hash"),
    transactionIndex: integer("transaction_index"),
    nonce: integer(),
    internalReference: text("internal_reference"),
    certificateId: uuid("certificate_id"),
    initiatedAt: timestamp("initiated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { mode: "string" }),
    failedAt: timestamp("failed_at", { mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "transactions_user_id_users_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.issuerApplicationId],
      foreignColumns: [application.id],
      name: "transactions_issuer_application_id_application_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.certificateId],
      foreignColumns: [certificates.id],
      name: "transactions_certificate_id_certificates_id_fk",
    }).onDelete("set null"),
    unique("transactions_transaction_hash_unique").on(table.transactionHash),
  ]
);

export const certificates = pgTable(
  "certificates",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    templateId: uuid("template_id"),
    issuerId: uuid("issuer_id").notNull(),
    recipientName: text("recipient_name").notNull(),
    recipientEmail: text("recipient_email"),
    recipientWallet: text("recipient_wallet"),
    certificateData: jsonb("certificate_data").notNull(),
    transactionDigest: text("transaction_digest"),
    blockchainId: text("blockchain_id"),
    status: certificateStatus().default("draft"),
    issuedAt: timestamp("issued_at", { mode: "string" }),
    expiresAt: timestamp("expires_at", { mode: "string" }),
    updateAt: timestamp("update_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    recipientId: text("recipient_id"),
    certificateHash: text("certificate_hash"),
    ipfsHash: text("ipfs_hash"),
    publishedAt: timestamp("published_at", { mode: "string" }),
    revokedAt: timestamp("revoked_at", { mode: "string" }),
    revokedBy: uuid("revoked_by"),
    revocationReason: text("revocation_reason"),
    isPublic: boolean("is_public").default(false),
    clientProvidedId: text("client_provided_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [certificateTemplates.id],
      name: "certificates_template_id_certificate_templates_id_fk",
    }),
    foreignKey({
      columns: [table.issuerId],
      foreignColumns: [issuers.id],
      name: "certificates_issuer_id_issuers_id_fk",
    }).onDelete("cascade"),
  ]
);

export const auditLogs = pgTable("audit_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "audit_logs_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  action: text().notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  userId: integer("user_id"),
  userEmail: text("user_email"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({
    name: "notifications_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  userId: integer("user_id").notNull(),
  type: text().notNull(),
  title: text().notNull(),
  message: text().notNull(),
  data: jsonb(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at", { mode: "string" }),
  expiresAt: timestamp("expires_at", { mode: "string" }),
  priority: text().default("normal"),
  updateAt: timestamp("update_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "string" }),
});

export const systemSettings = pgTable(
  "system_settings",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "system_settings_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    key: text().notNull(),
    value: jsonb().notNull(),
    description: text(),
    category: text(),
    isPublic: boolean("is_public").default(false),
    updateAt: timestamp("update_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [unique("system_settings_key_unique").on(table.key)]
);
