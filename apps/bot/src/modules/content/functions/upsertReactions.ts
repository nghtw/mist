import { container } from '@sapphire/pieces';
import type { MessageReaction, User, ThreadChannel } from 'discord.js';

export async function upsertReaction(
  reaction: MessageReaction,
  user: User,
  thread: ThreadChannel,
  action: 'add' | 'remove'
) {
  const message = reaction.message;
  const emoji = reaction.emoji.identifier; 

  if (!emoji) {
    console.error('Nie udało się uzyskać identyfikatora emoji.');
    return;
  }

  try {


    if (action === 'add') {
      await container.db.contentCommentReactions.upsert({
        where: {     
            commentId_emoji_userId: {
                commentId: BigInt(message.id),
                emoji,
                userId: BigInt(user.id),
            },
        },
        update: {
          updatedAt: new Date(),
        },
        create: {
          commentId: BigInt(message.id),
          emoji,
          userId: BigInt(user.id),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log('Reakcja dodana do bazy danych.');
    } else if (action === 'remove') {
      await container.db.contentCommentReactions.delete({
        where: {      
            commentId_emoji_userId: {
                commentId: BigInt(message.id),
                emoji,
                userId: BigInt(user.id),
            },
        },
      });
      console.log('Reakcja usunięta z bazy danych.');
    }
  } catch (error) {
    console.error('Błąd podczas upsertowania reakcji', error);
  }
}
