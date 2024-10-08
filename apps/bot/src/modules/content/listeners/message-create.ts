import { Listener } from '@sapphire/framework';
import type { Message, ThreadChannel } from 'discord.js';
import { getChannelWithEnabledContentFetching } from '../functions/config.js';
import { upsertComment } from '../functions/upsertComment.js';

export class MessageCreateListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'messageCreate',
    });
  }

  public async run(message: Message) {
    if (message.partial) await message.fetch();

    if (!message.channel.isThread()) return;

    const thread = message.channel as ThreadChannel;

    const result = await getChannelWithEnabledContentFetching();

    if (!result) {
      console.error('Nie znaleziono konfiguracji kanału.');
      return;
    }

    const channelId = result.channelId;

    if (thread.parentId !== channelId.toString()){
         return;
    }

    console.log('message was created', message.content);

    await upsertComment(message, thread);
  }
}
