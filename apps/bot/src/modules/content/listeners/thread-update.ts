import { Listener } from '@sapphire/framework';
import type { ThreadChannel } from 'discord.js';
import { getChannelWithEnabledContentFetching } from '../functions/config.js';
import { upsertThread } from '../functions/upsertThread.js';

export class ThreadUpdateListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'threadUpdate',
    });
  }

  public async run(oldThread: ThreadChannel, newThread: ThreadChannel) {
    const result = await getChannelWithEnabledContentFetching();

    if (!result) {
      console.error('Nie znaleziono konfiguracji kanału.');
      return;
    }

    const channelId = result.channelId;

    if (newThread.parentId !== channelId.toString()) {
      return; 
    }

    console.log('thread was updated', newThread.name);

    await upsertThread(newThread);
  }
}
