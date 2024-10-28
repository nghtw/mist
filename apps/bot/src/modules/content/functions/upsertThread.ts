import { container } from "@sapphire/pieces";
import type { ThreadChannel } from "discord.js";
import { getThreadAuthorUsername } from "./getThreadAuthorUsername.js";

export async function upsertThread(thread: ThreadChannel) {

  const author = await getThreadAuthorUsername(thread);

  if (!author) {
    throw new Error("Wątek nie ma przypisanego właściciela (ownerId) lub ten nie znajduje się w cache.");
  }

  try {
    await container.db.contentThreads.upsert({
      where: { id: BigInt(thread.id) },
      update: {
        content: thread.name,
        author,
        updatedAt: new Date(),
      },
      create: {
        id: BigInt(thread.id),
        content: thread.name,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`Wątek upsertowany: ${thread.name}`);
  } catch (error) {
    console.error(`Błąd podczas upsertowania wątku "${thread.name}":`, error);
  }
}
