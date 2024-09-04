import type { ThreadChannel } from "discord.js";

/**
 * Funkcja pobierająca nick autora wątku
 * @param thread Wątek z Discorda
 * @returns Nazwa użytkownika (nick) autora wątku
 */

export async function getThreadAuthorUsername(thread: ThreadChannel): Promise<string | null> {
  // Sprawdza, czy `ownerId` jest dostępny
  if (!thread.ownerId) {
    console.error("Wątek nie ma przypisanego właściciela (ownerId).");
    return null;
  }

  try {
    // Sprawdza, czy właściciel wątku jest w cache
    const owner = thread.client.users.cache.get(thread.ownerId);

    if (owner) {
      return owner.username;
    }
      // Jeśli właściciel nie jest w cache, pobierz dane z serwera
      const fetchedOwner = await thread.client.users.fetch(thread.ownerId);
      return fetchedOwner.username;
  } catch (error) {
    console.error("Błąd podczas pobierania autora wątku:", error);
    return null;
  }
}
