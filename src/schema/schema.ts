import z from "zod"
export const ApprovalIssuerSchema = z.object({
    domain: z.string(),
    institution: z.enum(['university', 'college', 'school', 'online_center', 'gov_agency', 'research_institute', 'training_provider', 'non_profie'])
})