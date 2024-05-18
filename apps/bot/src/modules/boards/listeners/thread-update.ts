import { Listener } from "@sapphire/framework";
import { type AnyThreadChannel, ChannelType } from "discord.js";
import { assert } from "../../../utils/assert.js";
import { TagBitsetOption, getBoardChannelConfig } from "../functions/config.js";
import { BoardTagConfig } from "@mist/database";

export class BoardsThreadUpdateListener extends Listener<"threadUpdate"> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: "threadUpdate",
    });
  }

  async run(
    oldThread: AnyThreadChannel<boolean>,
    newThread: AnyThreadChannel<boolean>
  ) {
    assert(oldThread.parentId, "Thread has no parent ID");
    const channelId = BigInt(oldThread.parentId);

    const config = await getBoardChannelConfig(channelId);

    if (!config || !config.enabled) {
      this.container.logger.debug(
        `BoardsThreadUpdateListener: Got thread update event for disabled channel ${channelId}`
      );
      return;
    }

    const channel = await oldThread.guild.channels.fetch(oldThread.parentId);
    assert(channel, "Channel not found");
    assert(
      channel.type === ChannelType.GuildForum,
      "Channel is not a board channel"
    );

    const oldThreadTagIds = oldThread.appliedTags.map((tag) => BigInt(tag));
    const newThreadTagIds = newThread.appliedTags.map((tag) => BigInt(tag));

    const tags = groupTagsByType(config.tags);
    const oldThreadTags = groupTagsByType(
      config.tags.filter((tag) => oldThreadTagIds.includes(tag.tagId))
    );
    const newThreadTags = groupTagsByType(
      config.tags.filter((tag) => newThreadTagIds.includes(tag.tagId))
    );

    // User locked the thread
    if (!oldThread.locked && newThread.locked) {
      // Skip if the thread has a closing status tag
      if (
        newThreadTags.status.length === 1 &&
        newThreadTags.status[0]?.statusOptions.get(TagBitsetOption.Closing)
      )
        return;

      // Find the status tag that should be applied on thread lock
      const status =
        tags.status.find((tag) =>
          tag.statusOptions.get(TagBitsetOption.AssignOnThreadLock)
        ) ?? // Fallback - try to find any closing status tag
        tags.status.find((tag) =>
          tag.statusOptions.get(TagBitsetOption.Closing)
        );

      if (status) {
        await newThread.setAppliedTags(
          [...newThreadTags.vanity, status].map((tag) => tag.tagId.toString())
        );
        await newThread.send(`Status changed to ${status.name}`);
      }
      return;
    }

    // User unlocked the thread
    if (oldThread.locked && !newThread.locked) {
      // Skip if the thread already doesn't have a closing status tag
      if (
        newThreadTags.status.length === 1 &&
        !newThreadTags.status[0]?.statusOptions.get(TagBitsetOption.Closing)
      )
        return;

      // Find the status tag that should be applied on thread unlock
      const status =
        tags.status.find((tag) =>
          tag.statusOptions.get(TagBitsetOption.AssignOnThreadUnlock)
        ) ?? // Fallback - try to find the tag that is applied on thread creation
        tags.status.find((tag) =>
          tag.statusOptions.get(TagBitsetOption.AssignOnThreadCreate)
        ) ?? // Fallback - try to find any non-closing status tag
        tags.status.find(
          (tag) => !tag.statusOptions.get(TagBitsetOption.Closing)
        );

      if (status) {
        await newThread.setAppliedTags(
          [...newThreadTags.vanity, status].map((tag) => tag.tagId.toString())
        );
        await newThread.send(`Status changed to ${status.name}`);
      }
      return;
    }

    // User added a status tag
    if (
      oldThreadTags.status.length === 1 &&
      newThreadTags.status.length === 2
    ) {
      const diff = newThreadTags.status.filter(
        (tag) => !oldThreadTags.status.includes(tag)
      );
      const status = diff[0];
      assert(status, "Status tag not found");
      await newThread.setAppliedTags(
        [...newThreadTags.vanity, status].map((tag) => tag.tagId.toString())
      );
      await newThread.send(`Status changed to ${status.name}`);

      // Lock/unlock thread based on status tag
      if (
        !status.statusOptions.get(TagBitsetOption.Closing) &&
        newThread.locked
      ) {
        await newThread.setLocked(false);
      } else if (
        status.statusOptions.get(TagBitsetOption.Closing) &&
        !newThread.locked
      ) {
        await newThread.setLocked(true);
      }

      return;
    }

    // Prevent user from removing all status tags
    if (newThreadTags.status.length < 1) {
      // Let's try to find the previous tag
      let previousStatus = oldThreadTags.status[0];

      // Fallback no. 1 - try to find the status tag that should be applied on thread creation
      previousStatus =
        previousStatus ??
        tags.status.find((tag) =>
          tag.statusOptions.get(TagBitsetOption.AssignOnThreadCreate)
        );

      // Fallback no. 2 - try to find any non-closing status tag
      previousStatus =
        previousStatus ??
        tags.status.find(
          (tag) => !tag.statusOptions.get(TagBitsetOption.Closing)
        );

      // If any found - apply
      if (previousStatus) {
        await newThread.setAppliedTags(
          [...newThreadTags.vanity, previousStatus].map((tag) =>
            tag.tagId.toString()
          )
        );
      }

      return;
    }
  }
}

type GroupTagsByTypeArg = Exclude<
  Awaited<ReturnType<typeof getBoardChannelConfig>>,
  null
>["tags"];

const groupTagsByType = (tags: GroupTagsByTypeArg) =>
  tags.reduce<Record<"status" | "vanity", GroupTagsByTypeArg>>(
    (acc, curr) => {
      if (curr.isStatus) {
        acc.status.push(curr);
      } else {
        acc.vanity.push(curr);
      }
      return acc;
    },
    { status: [], vanity: [] }
  );
