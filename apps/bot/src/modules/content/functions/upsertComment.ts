import { container } from "@sapphire/pieces";
import type { Message, ThreadChannel } from "discord.js";
//import { getThreadAuthorUsername } from "./getThreadAuthorUsername.js";

export async function upsertComment(message: Message, thread: ThreadChannel) {

  const author = message.author.username;

  if (!author) {
    throw new Error("Wątek nie ma przypisanego właściciela (ownerId) lub ten nie znajduje się w cache.");
  }

  try {
    await container.db.contentComments.upsert({
      where: { id: BigInt(message.id) },
      update: {
        content: message.content,
        author,
        updatedAt: new Date(),
      },
      create: {
        id: BigInt(message.id),
        threadId: BigInt(thread.id),
        content: message.content,
        author,
        createdAt: thread.createdAt ?? new Date(),
        updatedAt: new Date(),
      },
    });
    console.log('Wątek upsertowany:');
  } catch (error) {
    console.error('Błąd podczas upsertowania wątku', error);
  }
}
