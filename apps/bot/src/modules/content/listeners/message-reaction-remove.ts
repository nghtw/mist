// messageReactionRemove.ts
import { Listener } from '@sapphire/framework';
import type { MessageReaction, User, ThreadChannel } from 'discord.js';
import { getChannelWithEnabledContentFetching } from '../functions/config.js';
import { upsertReaction } from '../functions/upsertReactions.js';

export class MessageReactionRemoveListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      event: 'messageReactionRemove',
    });
  }

  public async run(reaction: MessageReaction, user: User) {
    // Upewnij się, że reakcja i wiadomość są w pełni załadowane
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const message = reaction.message;

    // Sprawdź, czy wiadomość jest w wątku
    if (!message.channel.isThread()) return;

    const thread = message.channel as ThreadChannel;

    const result = await getChannelWithEnabledContentFetching();

    if (!result) {
      console.error('Nie znaleziono konfiguracji kanału.');
      return;
    }

    const channelId = result.channelId;

    // Sprawdź, czy wątek należy do wybranego kanału
    if (thread.parentId !== channelId.toString()) return;

    // Wywołaj funkcję upsertReaction z akcją 'remove'
    await upsertReaction(reaction, user, thread, 'remove');
  }
}
