import { container } from "@sapphire/pieces";
import type { Attachment, Message } from "discord.js";

export async function upsertAttachment(attachment: Attachment, message: Message) {
  try {
    await container.db.contentCommentAttachment.upsert({
      where: { id: BigInt(attachment.id) },
      update: {
        commentId: BigInt(message.id),
        url: attachment.url,
        filename: attachment.name,
        updatedAt: new Date(),
      },
      create: {
        id: BigInt(attachment.id),
        commentId: BigInt(message.id),
        url: attachment.url,
        filename: attachment.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log('Załącznik upsertowany:');
  } catch (error) {
    console.error('Błąd podczas upsertowania załącznika:', error);
  }
}
