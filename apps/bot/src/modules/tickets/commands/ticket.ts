import { type Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import type { GuildChannel, Options, TextChannel } from "discord.js";
import { assert } from "../../../utils/assert.js";
import { localizedReply } from "../../../utils/localized-reply.js";
import { getTicketsConfig } from "../functions/config.js";

export class TicketCommand extends Subcommand {
  constructor(context: Subcommand.LoaderContext, options: Options) {
    super(context, {
      ...options,
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      subcommands: [
        {
          name: "create",
          chatInputRun: "chatInputCreate",
        },
        {
          name: "close",
          chatInputRun: "chatInputClose",
        },
      ],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("ticket")
        .setNameLocalizations({
          pl: "zgłoszenie",
        })
        .setDescription("Ticket commands")
        .setDescriptionLocalizations({
          pl: "Komendy do zarządzania zgłoszeniami",
        })
        .addSubcommand((subcommand) =>
          subcommand
            .setName("create")
            .setNameLocalizations({
              pl: "utwórz",
            })
            .setDescription("Create a new ticket")
            .setDescriptionLocalizations({
              pl: "Utwórz nowe zgłoszenie dla moderacji",
            })
            .addStringOption((option) =>
              option
                .setName("reason")
                .setDescription("Reason for creating the ticket")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("close")
            .setNameLocalizations({
              pl: "zamknij",
            })
            .setDescription("Close the ticket")
            .setDescriptionLocalizations({
              pl: "Zamknij zgłoszenie",
            })
            .addStringOption((option) =>
              option
                .setName("reason")
                .setNameLocalizations({
                  pl: "powód",
                })
                .setDescription("Reason for closing the ticket")
                .setDescriptionLocalizations({
                  pl: "Powód zamknięcia zgłoszenia",
                })
                .setRequired(false)
            )
        )
    );
  }

  public async chatInputCreate(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    await interaction.reply({
      content: localizedReply(interaction, "Creating a ticket...", {
        pl: "Tworzenie zgłoszenia...",
      }),
      ephemeral: true,
    });
    const guild = interaction.guild;
    assert(guild, "Guild is not available");
    const guildId = BigInt(guild.id);
    const reason = interaction.options.getString("reason", true);

    const config = await getTicketsConfig(guildId);

    if (!config || !config.enabled) {
      await interaction.editReply({
        content: localizedReply(interaction, "Tickets module is not enabled.", {
          pl: "Moduł zgłoszeń nie jest włączony.",
        }),
      });
      return;
    }

    if (
      !config.categoryId ||
      !(await guild.channels.fetch(`${config.categoryId}`))
    ) {
      await interaction.editReply({
        content: localizedReply(
          interaction,
          "Tickets category is not available. Contact the server administrator.",
          {
            pl: "Kategoria zgłoszeń nie jest dostępna. Skontaktuj się z administratorem serwera.",
          }
        ),
      });
      return;
    }

    const existingTicket = await this.container.db.ticket.findFirst({
      where: {
        guildId,
        userId: BigInt(interaction.user.id),
        closedAt: null,
      },
    });

    if (existingTicket) {
      await interaction.editReply({
        content: localizedReply(
          interaction,
          `You already have an open ticket: <#${existingTicket.channelId}>.`,
          {
            pl: `Masz już otwarte zgłoszenie: <#${existingTicket.channelId}>.`,
          }
        ),
      });
      return;
    }

    const channel = await guild.channels.create({
      name: `ticket-TBD-${interaction.user.username}`,
      parent: `${config.categoryId}`,
    });

    const localIdCounter = await this.container.db.$transaction(async (tx) => {
      const { localIdCounter } = await tx.ticketConfig.update({
        select: {
          localIdCounter: true,
        },
        where: {
          guildId,
        },
        data: {
          localIdCounter: {
            increment: 1,
          },
        },
      });

      await tx.ticket.create({
        data: {
          guildId,
          channelId: BigInt(channel.id),
          userId: BigInt(interaction.user.id),
          localId: localIdCounter,
        },
      });

      return localIdCounter;
    });

    // TODO: configurable prefix?
    channel.edit({
      name: `ticket-${localIdCounter}-${interaction.user.username}`,
    });

    // Add permissions for the creator of the ticket
    await channel.permissionOverwrites.create(interaction.user, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    await channel.send({
      content: localizedReply(
        interaction,
        `Ticket of <@${interaction.user.id}>, reason: ${reason}`,
        {
          pl: `Zgłoszenie <@${interaction.user.id}>, powód: ${reason}`,
        }
      ),
    });

    await interaction.editReply({
      content: localizedReply(
        interaction,
        `Created a ticket: <#${channel.id}>.`,
        {
          pl: `Utworzono zgłoszenie: <#${channel.id}>.`,
        }
      ),
    });
  }

  public async chatInputClose(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    // TODO: const reason = interaction.options.getString("reason", false);
    const { guild, channel } = interaction;
    assert(guild, "Guild is not available");
    assert(channel, "Channel is not available");
    const guildId = BigInt(guild.id);
    const channelId = BigInt(channel.id);

    const ticket = await this.container.db.ticket.findFirst({
      where: {
        guildId,
        channelId,
      },
    });

    if (!ticket) {
      await interaction.reply({
        content: localizedReply(interaction, "This is not a ticket channel.", {
          pl: "To nie jest kanał zgłoszenia.",
        }),
        ephemeral: true,
      });
      return;
    }

    // NOTE: We are not checking if the user is the creator of the ticket
    // because we assume that the user can only close the ticket if they have
    // access to the channel. This is enforced by the permissions set when
    // creating the ticket and permissions on the category.

    await this.container.db.ticket.update({
      where: {
        guildId,
        channelId,
      },
      data: {
        closedAt: new Date(),
      },
    });

    await channel.delete();
  }
}
