// deleteAllThreadTags.ts
import { container } from "@sapphire/pieces";


export async function deleteAllThreadTags(threadId: bigint): Promise<void> {
  try {
    await container.db.threadTag.deleteMany({
      where: {
        threadId: threadId,
      },
    });
    console.log(`Usunięto wszystkie tagi dla wątku ID: ${threadId}`);
  } catch (error) {
    console.error(`Błąd podczas usuwania tagów dla wątku ID: ${threadId}:`, error);
  }
}
