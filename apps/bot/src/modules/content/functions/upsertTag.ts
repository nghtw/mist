// upsertTag.ts
import { container } from "@sapphire/pieces";
import type { GuildForumTag } from "discord.js";
import { assert } from "../../../utils/assert.js";

interface UpsertTagParams {
  tag: GuildForumTag;
  channelId: bigint;
}

export async function upsertTag({ tag, channelId }: UpsertTagParams) {
  try {
    await container.db.contentTag.upsert({
      where: {
        id: tag.id, 
      },
      update: {
        name: tag.name,
        emoji: tag.emoji ? tag.emoji.name : null,
        updatedAt: new Date(),
      },
      create: {
        id: tag.id,
        channelId: channelId,
        name: tag.name,
        emoji: tag.emoji ? tag.emoji.name : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`Tag upsertowany: ${tag.name}`);
  } catch (error) {
    console.error(`Błąd podczas upsertowania tagu "${tag.name}":`, error);
  }
}
