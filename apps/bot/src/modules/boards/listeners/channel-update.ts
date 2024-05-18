import { Listener } from "@sapphire/framework";
import {
  ChannelType,
  type DMChannel,
  type NonThreadGuildBasedChannel,
} from "discord.js";
import { getBoardChannelConfig } from "../functions/config.js";

export class BoardsChannelUpdateListener extends Listener<"channelUpdate"> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: "channelUpdate",
    });
  }

  async run(
    _oldChannel: DMChannel | NonThreadGuildBasedChannel,
    newChannel: DMChannel | NonThreadGuildBasedChannel
  ) {
    if (newChannel.type !== ChannelType.GuildForum) {
      this.container.logger.debug(
        `BoardsChannelUpdateListener: Got channel update event for non-board channel ${newChannel.id}`
      );
      return;
    }

    const config = await getBoardChannelConfig(BigInt(newChannel.id));

    if (!config) {
      this.container.logger.debug(
        `BoardsChannelUpdateListener: Got channel update event for untracked channel ${newChannel.id}`
      );
      return;
    }

    const tagsToDelete = config.tags.filter(
      (tag) =>
        !newChannel.availableTags.find(
          (availableTag) => availableTag.id === tag.tagId.toString()
        )
    );

    const tagsToUpsert = newChannel.availableTags.filter((tag) => {
      const configTag = config.tags.find(
        (configTag) => configTag.tagId.toString() === tag.id
      );
      return (
        !configTag ||
        configTag.name !== tag.name ||
        configTag.emojiId !== tag.emoji?.id ||
        configTag.emojiName !== tag.emoji?.name ||
        configTag.moderated !== tag.moderated
      );
    });

    if (!tagsToDelete && !tagsToUpsert) {
      this.container.logger.debug(
        `BoardsChannelUpdateListener: No status tags changed in channel ${newChannel.id}`
      );
      return;
    }

    this.container.logger.info(
      `BoardsChannelUpdateListener: Detected changes for channel ${newChannel.id} - deleting ${tagsToDelete.length} tags, upserting ${tagsToUpsert.length} tags`
    );

    if (tagsToDelete.length > 0) {
      await this.container.db.boardTagConfig.deleteMany({
        where: {
          channelId: BigInt(newChannel.id),
          tagId: {
            in: tagsToDelete.map((tag) => BigInt(tag.tagId)),
          },
        },
      });
    }

    if (tagsToUpsert.length > 0) {
      for (const tag of tagsToUpsert) {
        await this.container.db.boardTagConfig.upsert({
          where: {
            tagId: BigInt(tag.id),
          },
          create: {
            channelId: BigInt(newChannel.id),
            tagId: BigInt(tag.id),
            name: tag.name,
            emojiId: tag.emoji?.id ?? null,
            emojiName: tag.emoji?.name ?? null,
            moderated: tag.moderated,
          },
          update: {
            name: tag.name,
            emojiId: tag.emoji?.id ?? null,
            emojiName: tag.emoji?.name ?? null,
            moderated: tag.moderated,
          },
        });
      }
    }
  }
}
