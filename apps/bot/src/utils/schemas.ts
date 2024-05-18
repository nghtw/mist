import { z } from "zod";

export const coerceBooleanSchema = z
  .string()
  // transform to boolean using preferred coercion logic
  .transform((s) => s !== "false" && s !== "0");

export const coerceableTrue = "true";
export const coerceableFalse = "false";
