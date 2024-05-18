import { env } from "./env.js";
import { MistSapphireClient } from "./client.js";
import { ApplicationCommandRegistries } from "@sapphire/framework";

ApplicationCommandRegistries.setDefaultGuildIds(["889120629763235850"]);

const client = new MistSapphireClient();

client.logger.info(`Starting in ${env.NODE_ENV} mode...`);
void client.login(env.BOT_TOKEN);

process.on("SIGTERM", () => {
  client.logger.info("Received SIGTERM, exiting...");
  void client.destroy().then(() => {
    process.exit(0);
  });
});
