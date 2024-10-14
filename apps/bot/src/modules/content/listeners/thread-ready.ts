import { Listener } from "@sapphire/framework";
import {
  TextChannel,
  NewsChannel,
  type ThreadChannel,
  Collection,
  ChannelType,
  type FetchedThreads,
  type ForumChannel,
  // type AnyThreadChannel, 
} from "discord.js";
import { getChannelWithEnabledContentFetching } from "../functions/config.js";
//import { getThreadAuthorUsername } from "../functions/getThreadAuthorUsername.js";
import { upsertThread } from "../functions/upsertThread.js";
import { upsertComment } from "../functions/upsertComment.js";
import { deleteAllReactions } from "../functions/deleteAllReactions.js";
import { upsertReaction } from "../functions/upsertReactions.js";
import { assert } from "../../../utils/assert.js";
import { upsertTag } from "../functions/upsertTag.js";
import { deleteAllThreadTags } from "../functions/deleteAllThreadTags.js";
import { upsertTagsForThread } from "../functions/upsertTagsForThread.js";
// import { assert } from "../../../utils/assert.js";



export class BoardsThreadFetchListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: 'ready', 
    });
  }

  async run() {

    const result = await getChannelWithEnabledContentFetching();

    assert(result, "Nie znaleziono konfiguracji kanału.");

 
    try {
      const channel = await this.container.client.channels.fetch(`${result.channelId}`);

      assert(channel, "Nie znaleziono kanału.");

      //console.log(`Pobrany kanał: ${channel.id}, typ: ${channel.type}`);

      if (
        channel instanceof TextChannel ||
        channel instanceof NewsChannel ||
        channel.type === ChannelType.GuildForum
      ) {
        console.log('Kanał jest poprawnym typem do pobierania wątków.');


        const forumChannel = channel as ForumChannel; 
        const tags = forumChannel.availableTags;

        if (tags.length > 0) {
          for (const tag of tags) {
            console.log(`Tag: ${tag.name}, Emoji: ${tag.emoji ? tag.emoji.name : 'Brak emoji'} ${tag.id}`);
            await upsertTag({ tag, channelId: BigInt(result.channelId) });
          }
        } 


        let activeThreads: FetchedThreads | null = null;  
        let archivedThreads: FetchedThreads | null = null;  
        
       
        activeThreads = await channel.threads.fetchActive();
        console.log(`Znaleziono aktywne wątki: ${activeThreads.threads.size}`);

        assert(activeThreads, "Błąd podczas pobierania aktywnych wątków.");
      

        
          archivedThreads = await channel.threads.fetchArchived();
          console.log(`Znaleziono zarchiwizowane wątki: ${archivedThreads.threads.size}`);
      
          assert(archivedThreads, "Błąd podczas pobierania zarchiwizowanych wątków.");

        
        const allThreads = new Collection<string, ThreadChannel>();

        if (activeThreads) {
          for (const thread of activeThreads.threads.values()) {
            allThreads.set(thread.id, thread);
          }
        }
        
        if (archivedThreads) {
          for (const thread of archivedThreads.threads.values()) {
            allThreads.set(thread.id, thread);
          }
        }

        console.log(`Łączna liczba wątków: ${allThreads.size}`);


        assert(allThreads.size > 0, "Nie znaleziono wątków w kanale.");

        // iterowanie po istniejących wątkach, nawet tych zarchiwizowanych

        for (const thread of allThreads.values()) {
          //console.log(`Wątek: ${thread}`);

          if (thread.appliedTags) {
            console.log(`Tagi wątku: ${thread.appliedTags}`);
          }
          

           await upsertThread(thread);

                // Zarządzanie tagami wątku
                const appliedTagIds = thread.appliedTags || [];

          // Usunięcie wszystkich tagów dla wątku
          await deleteAllThreadTags(BigInt(thread.id));

          //  Przypisanie nowych tagów
          await upsertTagsForThread({
            threadId: BigInt(thread.id),
            tagIds: appliedTagIds,
          });

          
            const messages = await thread.messages.fetch();
            //console.log(`Liczba wiadomości w wątku "${thread.name}": ${messages.size}`);
            //assert(messages.size > 0, "Brak wiadomości w wątku.");


            for (const message of messages.values()) {
              console.log(`Wiadomość: ${message.content} author: ${message.author.username}`);
              await upsertComment(message,thread);

              // aktualizacja wszystkich reakcji

              await deleteAllReactions(message);
              const reactions = message.reactions.cache;

              for (const reaction of reactions.values()) {
                const users = await reaction.users.fetch();
                
                for (const user of users.values()) {
                  await upsertReaction(reaction, user, thread, 'add');
                }
              }

              
            }

        }
      } else {
        console.error("Kanał nie jest typu TextChannel, NewsChannel, GuildForum lub nie obsługuje wątków.");
      }
    } catch (error) {
      console.error("Błąd podczas pobierania kanału lub wątków:", error);
    }
  }
}
