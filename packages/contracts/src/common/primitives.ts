import { z } from "zod";

export const IdSchema = z.uuid();

export const DateTimeSchema = z.iso.datetime();

export const ScoreSchema = z.number().min(0).max(100);

export const NonEmptyStringSchema = z.string().trim().min(1);

export const EmailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email."));

export type Id = z.infer<typeof IdSchema>;
export type DateTime = z.infer<typeof DateTimeSchema>;
export type Score = z.infer<typeof ScoreSchema>;
export type Email = z.infer<typeof EmailSchema>;
