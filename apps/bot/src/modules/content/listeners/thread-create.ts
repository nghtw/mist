
import { Listener } from '@sapphire/framework';
import type { ThreadChannel } from 'discord.js';
import { getChannelWithEnabledContentFetching } from '../functions/config.js';
import { upsertThread } from '../functions/upsertThread.js';

export class ThreadCreateListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'threadCreate',
    });
  }

  public async run(thread: ThreadChannel) {
    const result = await getChannelWithEnabledContentFetching();

    if (!result) {
      console.error('Nie znaleziono konfiguracji kanału.');
      return;
    }


    if (thread.parentId !== result.toString()) {
      return; 
    }

    console.log('thread was updated', thread.name);

    await upsertThread(thread);
  }
}
