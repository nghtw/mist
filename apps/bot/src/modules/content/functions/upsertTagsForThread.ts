// upsertTagsForThread.ts
import { container } from "@sapphire/pieces";

interface AssignTagsToThreadParams {
  threadId: bigint;
  tagIds: string[];
}


export async function upsertTagsForThread({ threadId, tagIds }: AssignTagsToThreadParams): Promise<void> {
  try {
    const createThreadTags = tagIds.map((tagId) => ({
      threadId: threadId,
      tagId: tagId,
    }));

    if (createThreadTags.length > 0) {
      await container.db.threadTag.createMany({
        data: createThreadTags,
      });
      console.log(`Przypisano ${createThreadTags.length} tagi do wątku ID: ${threadId}`);
    } else {
      //console.log(`Nie przypisano żadnych tagów do wątku ID: ${threadId}`);
    }
  } catch (error) {
    console.error(`Błąd podczas przypisywania tagów do wątku ID: ${threadId}:`, error);
  }
}
