import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { PermissionFlagsBits } from "discord.js";
import { TagBitsetOption, getBoardChannelConfig } from "../functions/config.js";

export class BoardDebugCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      runIn: CommandOptionsRunTypeEnum.GuildAny,
      requiredUserPermissions: [PermissionFlagsBits.Administrator],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("board-debug")
        .setNameLocalizations({
          pl: "forum-debug",
        })
        .setDescription("Check configuration options for a board channel")
        .setDescriptionLocalizations({
          pl: "Sprawdź opcje konfiguracji dla kanału forum",
        })
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setNameLocalizations({
              pl: "kanał",
            })
            .setDescription("The channel to check")
            .setDescriptionLocalizations({
              pl: "Kanał do sprawdzenia",
            })
            .setRequired(true)
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.reply({
      content: "Checking configuration...",
      ephemeral: true,
      fetchReply: true,
    });

    const channelId = BigInt(
      interaction.options.getChannel("channel", true).id
    );
    const config = await getBoardChannelConfig(channelId);

    if (!config) {
      return interaction.editReply(
        `No configuration found for channel ${channelId}`
      );
    }

    interaction.editReply(
      `Configuration for channel ${channelId}:
- Enabled: ${config.enabled}
- Tags:
${config.tags
  .map(
    (tag) =>
      `  - \`${tag.tagId}\` ${tag.name} ${Object.entries(TagBitsetOption)
        .map(([name, mask]) => (tag.statusOptions.get(mask) ? name : null))
        .filter((v) => v)
        .join(", ")}`
  )
  .join("\n")}`
    );
  }
}
