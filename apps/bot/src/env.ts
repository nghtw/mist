import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: [".env", "../../.env"] });

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  CLIENT_ID: z.string(),
  BOT_TOKEN: z.string(),
  DATABASE_URL: z.string().url(),
  GUILD_IDS: z
    .string()
    .transform((value) => value.replaceAll(" ", "").split(",")),
});

export const env = (() => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid env variables!");
    for (const error of parsed.error.errors) {
      console.error(`- ${error.path.join(".")} ${error.message}`);
    }
    process.exit(1);
  }
  return parsed.data;
})();
