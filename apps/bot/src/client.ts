import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-subcommands/register";

import { join } from "node:path";
import { PrismaClient } from "@mist/database";
import { SapphireClient, container } from "@sapphire/framework";
import { getRootData } from "@sapphire/pieces";
import { IntentsBitField } from "discord.js";

declare module "@sapphire/pieces" {
  interface Container {
    db: PrismaClient;
  }
}

export class MistSapphireClient extends SapphireClient {
  private rootData = getRootData();

  public constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent,
      ],
    });
    this.stores.registerPath(join(this.rootData.root, "modules/boards"));
    this.stores.registerPath(join(this.rootData.root, "modules/debug"));
    this.stores.registerPath(join(this.rootData.root, "modules/managed-roles"));
    this.stores.registerPath(join(this.rootData.root, "modules/tickets"));
  }

  public override async login(token?: string) {
    container.db = new PrismaClient();
    container.logger.info("MistSapphireClient: Connecting to the database...");
    try {
      await container.db.$connect();
      container.logger.info("MistSapphireClient: Connected to the database.");
    } catch (e) {
      container.logger.error(
        "MistSapphireClient: Failed to connect to the database."
      );
      container.logger.error(e);
      process.exit(1);
    }
    return super.login(token);
  }

  public override async destroy() {
    container.logger.info("MistSapphireClient: Stopping the bot...");
    container.logger.info(
      "MistSapphireClient: Closing the database connection..."
    );
    await container.db.$disconnect();
    container.logger.info(
      "MistSapphireClient: Closed the database connection."
    );
    container.logger.info("MistSapphireClient: Destroying Sapphire client...");
    await super.destroy();
    container.logger.info("MistSapphireClient: Sapphire client destroyed.");
    container.logger.info("MistSapphireClient: Bot stopped.");
  }
}
