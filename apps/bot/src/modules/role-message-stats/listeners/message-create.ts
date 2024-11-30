import { Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { assert } from "../../../utils/assert.js";

export class RoleMessageStatsMessageSentListener extends Listener<
  typeof Events.MessageCreate
> {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
    });
  }

  async run(message: Message<boolean>) {
    assert(message.guild, "Message is not in a guild");
    const guildId = BigInt(message.guild.id);
    const authorMember = await message.guild.members.fetch(message.author.id);
    const roles = authorMember.roles.cache;

    const currentDay = (() => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    })();

    for (const [roleIdString] of roles) {
      const roleId = BigInt(roleIdString);
      await this.container.db.roleMessageStats.upsert({
        where: {
          guildId_roleId_timestamp: {
            guildId,
            roleId,
            timestamp: currentDay,
          },
        },
        create: {
          guildId,
          roleId,
          messageCount: 1,
          timestamp: currentDay,
        },
        update: {
          messageCount: {
            increment: 1,
          },
        },
      });
    }
  }
}
