import { Listener } from '@sapphire/framework';
import type { Message, ThreadChannel } from 'discord.js';
import { getChannelWithEnabledContentFetching } from '../functions/config.js';
import { upsertComment } from '../functions/upsertComment.js';

export class MessageUpdateListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'messageUpdate',
    });
  }

  public async run(oldMessage: Message, newMessage: Message) {
    if (newMessage.partial) await newMessage.fetch();

    if (!newMessage.channel.isThread()) return;

    const thread = newMessage.channel as ThreadChannel;

    const result = await getChannelWithEnabledContentFetching();

    if (!result) {
      console.error('Nie znaleziono konfiguracji kanału.');
      return;
    }

    const channelId = result.channelId;

    if (thread.parentId !== channelId.toString()) {
        return;
    }

    console.log('message was updated', newMessage.content);



    if (newMessage.reactions.cache.size > 0) {
        console.log('Reactions found for the updated message:');
  

        for (const [emoji, reaction] of newMessage.reactions.cache) {
          console.log(`Reaction: ${reaction.emoji.name}, Count: ${reaction.count}`);
        }
      } else {
        console.log('No reactions found for the updated message.');
      }

    await upsertComment(newMessage, thread);
  }
}
