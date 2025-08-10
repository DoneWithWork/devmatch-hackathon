import z from "zod";
export const ApprovalIssuerSchema = z.object({
  domain: z.string(),
  organization: z.string().optional(), // Allow any organization type as free text (changed from institution)
});
