import { Listener } from "@sapphire/framework";
import {
  ChannelType,
  type DMChannel,
  type NonThreadGuildBasedChannel,
} from "discord.js";
import { assert } from "../../../utils/assert.js";
import { getTicketsConfig } from "../functions/config.js";

export class TicketsChannelCreateListener extends Listener<"channelCreate"> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: "channelCreate",
    });
  }

  async run(channel: DMChannel | NonThreadGuildBasedChannel) {
    /*
    TODO: This won't work as the event may come before the ticket is created in the database
    We could use a setTimeout to wait for the ticket to be created, but that's not ideal
    since it may prevent the bot from shutting down properly (db connection not closed).

    if (channel.type !== ChannelType.GuildText) return;

    const guildId = BigInt(channel.guild.id);
    const channelId = BigInt(channel.id);

    // Possible ticket channel must have a parent
    if (!channel.parentId) return;

    const parentId = BigInt(channel.parentId);

    // Check if the parent channel is a ticket category
    const config = await getTicketsConfig(guildId);

    if (!config || parentId !== config.categoryId) return;

    const ticket = await this.container.db.ticket.findUnique({
      where: {
        guildId,
        channelId,
      },
    });

    // Delete the channel if no ticket exists
    if (!ticket) {
      this.container.logger.info(
        `Deleting newly-created channel ${channelId} in a controlled ticket category ${parentId} as no ticket exists for it.`
      );
      await channel.delete();
    }
    */
  }
}
