import * as dotenv from "dotenv";

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Explicitly load the .env file from the root of the monorepo
dotenv.config({ path: [".env", "../../.env"] });

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
