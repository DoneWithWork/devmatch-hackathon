import { ApprovalIssuerSchema } from "@/schema/schema";
import z from "zod";

export const initialState = { success: false, errorMessage: "", errors: {} };
export interface ActionResponse<T> {
    success: boolean;
    errorMessage?: string;
    message?: string;
    errors?: {
        [K in keyof T]?: string[]
    },
    inputs?: T
}
export type ApprovalIssuerType = z.infer<typeof ApprovalIssuerSchema>
export type ApprovalIssuerInstitutionType = z.infer<typeof ApprovalIssuerSchema.shape.institution>