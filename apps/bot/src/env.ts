import { container } from "@sapphire/pieces";
import * as dotenv from "dotenv";
import { z } from "zod";
import { coerceBooleanSchema, coerceableTrue } from "./utils/schemas.js";

dotenv.config({ path: [".env", "../../.env"] });

const envSchema = z.object({
  CLIENT_ID: z.string(),
  BOT_TOKEN: z.string(),
  ENABLE_API: coerceBooleanSchema.default(coerceableTrue),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.string().default("development"),
  GUILD_IDS: z
    .string()
    .transform((value) => value.replaceAll(" ", "").split(",")),
});

export const env = (() => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    container.logger.error("Invalid env variables!");
    for (const error of parsed.error.errors) {
      container.logger.error(`- ${error.path.join(".")} ${error.message}`);
    }
    process.exit(1);
  }
  return parsed.data;
})();
