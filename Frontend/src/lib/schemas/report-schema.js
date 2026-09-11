// ============================================================================
// lib/schemas/report-schema.js — Zod Validation for Report Forms
// ============================================================================
import { z } from "zod";

/** Schema for the "Report Missing Person" multi-step form */
export const missingPersonSchema = z.object({
  // Step 1: Identity
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  last_name: z.string().max(100, "Last name is too long").optional().or(z.literal("")),
  approximate_age: z.coerce
    .number()
    .int()
    .min(0, "Age must be positive")
    .max(120, "Age seems too high")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"], {
    required_error: "Gender is required",
  }),

  // Step 2: Description
  distinguishing_marks: z.string().max(1000).optional().or(z.literal("")),
  clothing_description: z.string().max(1000).optional().or(z.literal("")),

  // Step 3: Location & Photo
  last_known_location: z
    .string()
    .min(1, "Last known location is required")
    .max(500),
});

/** Schema for the "Report Rescued Person" single-page form */
export const rescuedPersonSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  last_name: z.string().max(100).optional().or(z.literal("")),
  approximate_age: z.coerce
    .number()
    .int()
    .min(0, "Age must be positive")
    .max(120, "Age seems too high")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"], {
    required_error: "Gender is required",
  }),
  distinguishing_marks: z.string().max(1000).optional().or(z.literal("")),
  clothing_description: z.string().max(1000).optional().or(z.literal("")),
  last_known_location: z
    .string()
    .min(1, "Location / facility is required")
    .max(500),
  facility: z.string().optional().or(z.literal("")),
});
