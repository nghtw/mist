import { Listener } from "@sapphire/framework";
import {
  ChannelType,
  type DMChannel,
  type NonThreadGuildBasedChannel,
} from "discord.js";

export class BoardsChannelDeleteListener extends Listener<"channelDelete"> {
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
    if (channel.type !== ChannelType.GuildForum) return;
    const res = await this.container.db.boardChannelConfig.deleteMany({
      where: {
        channelId: BigInt(channel.id),
      },
    });
    if (res.count === 0) return;
    this.container.logger.info(
      `Deleted board channel config for deleted channel ${channel.id}`
    );
  }
}
