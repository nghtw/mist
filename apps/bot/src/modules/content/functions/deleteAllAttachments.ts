import { container } from "@sapphire/pieces";
import type { Message } from "discord.js";

export async function deleteAllAttachments(message: Message) {
  try {
    await container.db.contentCommentAttachment.deleteMany({
      where: {
        commentId: BigInt(message.id),
      },
    });
    console.log('Wszystkie załączniki dla komentarza usunięte.');
  } catch (error) {
    console.error('Błąd podczas usuwania załączników:', error);
  }
}
