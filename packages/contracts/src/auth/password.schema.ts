import { z } from "zod";

export const PasswordSchema = z
  .string()
  .min(10, "Password must contain at least 10 characters.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(/[^A-Za-z0-9\s]/, "Password must contain at least one special character.")
  .regex(/^\S+$/, "Password cannot contain spaces.");

export type Password = z.infer<typeof PasswordSchema>;
