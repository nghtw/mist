import { Listener } from "@sapphire/framework";
import {
  TextChannel,
  NewsChannel,
  type ThreadChannel,
  Collection,
  ChannelType,
  type FetchedThreads, 
} from "discord.js";
// import { assert } from "../../../utils/assert.js";

// pole bitwy

export class BoardsThreadFetchListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: "ready", 
    });
  }

  async run() {
    console.log('Listener uruchomiony: ready event');
    const channelId = '1244377740044402819';
    try {
      const channel = await this.container.client.channels.fetch(channelId);

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
          console.log(`Wątek: ${thread.name}`);

          try {
            const messages = await thread.messages.fetch();
            console.log(`Liczba wiadomości w wątku "${thread.name}": ${messages.size}`);
            for (const message of messages.values()) {
              console.log(`Wiadomość: ${message.content} author: ${message.author.username}`);
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
