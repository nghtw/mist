import { Listener } from "@sapphire/framework";
import {
  ChannelType,
  type DMChannel,
  type NonThreadGuildBasedChannel,
} from "discord.js";

export class TicketsChannelDeleteListener extends Listener<"channelDelete"> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: "channelDelete",
    });
  }

  async run(channel: DMChannel | NonThreadGuildBasedChannel) {
    if (channel.type !== ChannelType.GuildText) return;

    const guildId = BigInt(channel.guild.id);
    const channelId = BigInt(channel.id);

    const res = await this.container.db.ticket.updateMany({
      where: {
        guildId,
        channelId,
      },
      data: {
        closedAt: new Date(),
      },
    });

    if (res.count === 0) return;
    this.container.logger.info(
      `Closed ticket ${channelId} due to channel deletion`
    );
  }
}
