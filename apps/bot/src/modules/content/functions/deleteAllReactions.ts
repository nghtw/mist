import { container } from '@sapphire/pieces';
import type { Message } from 'discord.js';

export async function deleteAllReactions(message: Message) {
  const messageId = BigInt(message.id); 

  try {
    await container.db.contentCommentReactions.deleteMany({
      where: {
        commentId: messageId,
      },
    });

    console.log(`Wszystkie reakcje dla wiadomości o ID ${message.id} zostały usunięte.`);
  } catch (error) {
    console.error('Błąd podczas usuwania reakcji:', error);
  }
}
