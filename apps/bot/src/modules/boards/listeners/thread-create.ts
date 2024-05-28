import { Listener } from "@sapphire/framework";
import { type AnyThreadChannel, ChannelType } from "discord.js";
import { assert } from "../../../utils/assert.js";
import { TagBitsetOption, getBoardChannelConfig } from "../functions/config.js";

export class BoardsThreadCreateListener extends Listener<"threadCreate"> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: "threadCreate",
    });
  }

  async run(thread: AnyThreadChannel<boolean>, _newlyCreated: boolean) {
    assert(thread.parentId, "Thread has no parent ID");
    const channelId = BigInt(thread.parentId);

    const config = await getBoardChannelConfig(channelId);

    if (!config || !config.enabled) {
      this.container.logger.debug(
        `BoardsThreadCreateListener: Got thread create event for disabled channel ${channelId}`
      );
      return;
    }

    const channel = await thread.guild.channels.fetch(thread.parentId);
    assert(channel, "Channel not found");
    assert(
      channel.type === ChannelType.GuildForum,
      "Channel is not a board channel"
    );

    const status = config.tags.find(
      (tag) =>
        tag.isStatus &&
        tag.statusOptions.get(TagBitsetOption.AssignOnThreadCreate)
    );

    if (!status) {
      this.container.logger.debug(
        `BoardsThreadCreateListener: No status tag found for new channel ${channelId}`
      );
      return;
    }

    const newTags = [
      // Add all tags from the thread, except for status tags
      ...thread.appliedTags
        .map((tag) => BigInt(tag))
        .filter(
          (tag) =>
            !config.tags.find((configTag) => configTag.tagId === tag)?.isStatus
        ),
      // Add the tag that should be applied on thread creation
      status.tagId,
    ].map((tag) => tag.toString());

    await thread.setAppliedTags(newTags);

    this.container.logger.info(
      `BoardsThreadCreateListener: Thread created with status ${status.name} in channel ${channelId}`
    );

    const tagName = channel.availableTags.find(
      (tag) => tag.id === status.tagId.toString()
    )?.name;

    await thread.send({
      content: (
        config.threadCreatedMessage ?? "Thread created with status {tagName}."
      )
        .replaceAll("{userId}", thread.ownerId || "")
        .replaceAll("{tagName}", tagName || ""),
    });
  }
}
