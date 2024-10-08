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

    if (!result) {
      console.error("Nie znaleziono konfiguracji kanału.");
      return;
    }

   
 
    try {
      const channel = await this.container.client.channels.fetch(`${result.channelId}`);

      if (!channel) {
        console.error("Nie znaleziono kanału.");
        return;
      }

      console.log(`Pobrany kanał: ${channel.id}, typ: ${channel.type}`);

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
          }
        } else {
          console.log('Brak dostępnych tagów w tym kanale.');
        }


        let activeThreads: FetchedThreads | null = null;  
        let archivedThreads: FetchedThreads | null = null;  
        
        try {
          activeThreads = await channel.threads.fetchActive();
          console.log(`Znaleziono aktywne wątki: ${activeThreads.threads.size}`);
        } catch (error) {
          console.error("Błąd podczas pobierania aktywnych wątków:", error);
        }

        try {
          archivedThreads = await channel.threads.fetchArchived();
          console.log(`Znaleziono zarchiwizowane wątki: ${archivedThreads.threads.size}`);
        } catch (error) {
          console.error("Błąd podczas pobierania zarchiwizowanych wątków:", error);
        }

        
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

        if (allThreads.size === 0) {
          console.log("Nie znaleziono wątków w kanale.");
          return;
        }

        for (const thread of allThreads.values()) {
          console.log(`Wątek: ${thread}`);

          if (thread.appliedTags) {
            console.log(`Tagi wątku: ${thread.appliedTags}`);
          }
          

           await upsertThread(thread);

          try {
            const messages = await thread.messages.fetch();
            console.log(`Liczba wiadomości w wątku "${thread.name}": ${messages.size}`);
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
          } catch (error) {
            console.error(`Błąd podczas pobierania wiadomości z wątku "${thread.name}":`, error);
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
