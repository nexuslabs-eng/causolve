import { z } from "zod";
import { AcceptInvitationRequestSchema } from "contracts";

export const InvitationAcceptanceFormSchema =
    AcceptInvitationRequestSchema
        .omit({
            token: true,
        })
        .extend({
            confirmPassword: z.string().min(1, "Confirm your password."),
        })
        .refine((values) => values.password === values.confirmPassword, {
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        });

export type InvitationAcceptanceFormValues = z.infer<
    typeof InvitationAcceptanceFormSchema
>;