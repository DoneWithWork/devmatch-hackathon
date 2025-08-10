import { relations } from "drizzle-orm/relations";
import { issuers, certificateTemplates, users, application, documents, certificates, individualCertificates, transactions, gasBalanceHistory } from "./schema";

export const certificateTemplatesRelations = relations(certificateTemplates, ({one, many}) => ({
	issuer: one(issuers, {
		fields: [certificateTemplates.issuerId],
		references: [issuers.id]
	}),
	certificates: many(certificates),
}));

export const issuersRelations = relations(issuers, ({one, many}) => ({
	certificateTemplates: many(certificateTemplates),
	user: one(users, {
		fields: [issuers.userId],
		references: [users.id]
	}),
	certificates: many(certificates),
}));

export const usersRelations = relations(users, ({many}) => ({
	issuers: many(issuers),
	applications_applicantId: many(application, {
		relationName: "application_applicantId_users_id"
	}),
	applications_reviewedBy: many(application, {
		relationName: "application_reviewedBy_users_id"
	}),
	documents_userId: many(documents, {
		relationName: "documents_userId_users_id"
	}),
	documents_verifiedBy: many(documents, {
		relationName: "documents_verifiedBy_users_id"
	}),
	transactions: many(transactions),
}));

export const applicationRelations = relations(application, ({one, many}) => ({
	user_applicantId: one(users, {
		fields: [application.applicantId],
		references: [users.id],
		relationName: "application_applicantId_users_id"
	}),
	user_reviewedBy: one(users, {
		fields: [application.reviewedBy],
		references: [users.id],
		relationName: "application_reviewedBy_users_id"
	}),
	documents: many(documents),
	transactions: many(transactions),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	user_userId: one(users, {
		fields: [documents.userId],
		references: [users.id],
		relationName: "documents_userId_users_id"
	}),
	application: one(application, {
		fields: [documents.issuerApplicationId],
		references: [application.id]
	}),
	user_verifiedBy: one(users, {
		fields: [documents.verifiedBy],
		references: [users.id],
		relationName: "documents_verifiedBy_users_id"
	}),
}));

export const individualCertificatesRelations = relations(individualCertificates, ({one}) => ({
	certificate: one(certificates, {
		fields: [individualCertificates.certificateId],
		references: [certificates.id]
	}),
}));

export const certificatesRelations = relations(certificates, ({one, many}) => ({
	individualCertificates: many(individualCertificates),
	transactions: many(transactions),
	certificateTemplate: one(certificateTemplates, {
		fields: [certificates.templateId],
		references: [certificateTemplates.id]
	}),
	issuer: one(issuers, {
		fields: [certificates.issuerId],
		references: [issuers.id]
	}),
}));

export const gasBalanceHistoryRelations = relations(gasBalanceHistory, ({one}) => ({
	transaction: one(transactions, {
		fields: [gasBalanceHistory.transactionId],
		references: [transactions.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one, many}) => ({
	gasBalanceHistories: many(gasBalanceHistory),
	user: one(users, {
		fields: [transactions.userId],
		references: [users.id]
	}),
	application: one(application, {
		fields: [transactions.issuerApplicationId],
		references: [application.id]
	}),
	certificate: one(certificates, {
		fields: [transactions.certificateId],
		references: [certificates.id]
	}),
}));