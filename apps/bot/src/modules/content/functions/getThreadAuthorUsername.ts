import type { ThreadChannel } from "discord.js";



export async function getThreadAuthorUsername(thread: ThreadChannel): Promise<string | null> {

  if (!thread.ownerId) {
    console.error("Wątek nie ma przypisanego właściciela (ownerId).");
    return null;
  }

  try {

    const owner = thread.client.users.cache.get(thread.ownerId);

    if (owner) {
      return owner.username;
    }

      const fetchedOwner = await thread.client.users.fetch(thread.ownerId);
      return fetchedOwner.username;
  } catch (error) {
    console.error("Błąd podczas pobierania autora wątku:", error);
    return null;
  }
}
