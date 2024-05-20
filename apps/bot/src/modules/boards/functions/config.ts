import { container } from "@sapphire/pieces";
import { bitset } from "../../../utils/bitset.js";

export const TagBitsetOption = {
  Closing: 0b1,
  AssignOnThreadCreate: 0b10,
  AssignOnThreadUnlock: 0b100,
  AssignOnThreadLock: 0b1000,
} as const;

export type TagBitsetOption =
  (typeof TagBitsetOption)[keyof typeof TagBitsetOption];

export async function getBoardChannelConfig(channelId: bigint) {
  const config = await container.db.boardChannelConfig.findUnique({
    where: {
      channelId,
    },
    select: {
      enabled: true,
      threadCreatedMessage: true,
      threadStatusChangedMessage: true,
      tags: {
        select: {
          tagId: true,
          channelId: true,
          name: true,
          moderated: true,
          emojiId: true,
          emojiName: true,
          isStatus: true,
          statusOptions: true,
        },
      },
    },
  });

  return config
    ? {
        ...config,
        tags: config.tags.map((tag) => ({
          ...tag,
          statusOptions: bitset<TagBitsetOption>(tag.statusOptions),
        })),
      }
    : null;
}
