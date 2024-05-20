import {
  ApplicationCommandRegistries,
  RegisterBehavior,
} from "@sapphire/framework";
import { MistSapphireClient } from "./client.js";
import { env } from "./env.js";

ApplicationCommandRegistries.setDefaultGuildIds(env.GUILD_IDS);
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite
);

const client = new MistSapphireClient();

client.logger.info(`Starting in ${env.NODE_ENV} mode...`);
void client.login(env.BOT_TOKEN);

process.on("SIGTERM", () => {
  client.logger.info("Received SIGTERM, exiting...");
  void client.destroy().then(() => {
    process.exit(0);
  });
});
