import { Command, CommandOptionsRunTypeEnum, none } from "@sapphire/framework";
import { PermissionFlagsBits } from "discord.js";
import { getManagedRolesConfig } from "../functions/config.js";
import { assert } from "../../../utils/assert.js";
import { localizedReply } from "../../../utils/localized-reply.js";

/**
 * This doesn't extend Subcommand because most logic is shared.
 */
export class ManagedRolesManagedRoleCommand extends Command {
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
        .setName("managed-role")
        .setNameLocalizations({
          pl: "rola-zarządzana",
        })
        .setDescription("Manage a role")
        .setDescriptionLocalizations({
          pl: "Zarządzaj rolą",
        })
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setNameLocalizations({
              pl: "nadaj",
            })
            .setDescription("Assign a role to a user")
            .setDescriptionLocalizations({
              pl: "Przypisz rolę do użytkownika",
            })
            // We're not using `addRoleOption` because we want custom autocomplete
            .addStringOption((option) =>
              option
                .setName("role")
                .setNameLocalizations({
                  pl: "rola",
                })
                .setDescription("The role to assign")
                .setDescriptionLocalizations({
                  pl: "Rola do przypisania",
                })
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addUserOption((option) =>
              option
                .setName("user")
                .setNameLocalizations({
                  pl: "użytkownik",
                })
                .setDescription("The user to assign the role to")
                .setDescriptionLocalizations({
                  pl: "Użytkownik do przypisania roli",
                })
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setNameLocalizations({
              pl: "usuń",
            })
            .setDescription("Remove a role from a user")
            .setDescriptionLocalizations({
              pl: "Usuń rolę użytkownika",
            })
            // We're not using `addRoleOption` because we want custom autocomplete
            .addStringOption((option) =>
              option
                .setName("role")
                .setNameLocalizations({
                  pl: "rola",
                })
                .setDescription("The role to assign")
                .setDescriptionLocalizations({
                  pl: "Rola do usunięcia",
                })
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addUserOption((option) =>
              option
                .setName("user")
                .setNameLocalizations({
                  pl: "użytkownik",
                })
                .setDescription("The user to remove the role from")
                .setDescriptionLocalizations({
                  pl: "Użytkownik do usunięcia roli",
                })
                .setRequired(true)
            )
        )
    );
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.reply({
      content: localizedReply(
        interaction,
        "Performing role management action...",
        {
          pl: "Wykonuję akcję...",
        }
      ),
      ephemeral: true,
    });

    assert(interaction.guildId, "Guild ID is not available");
    const guildId = BigInt(interaction.guildId);
    const config = await getManagedRolesConfig(guildId);
    const subcommand = interaction.options.getSubcommand(true);
    const roleId = BigInt(interaction.options.getString("role", true));
    const user = interaction.options.getUser("user", true);

    // Fetch user roles from discord
    const guildUser = await interaction.guild?.members.fetch(
      interaction.user.id
    );

    assert(guildUser, "Guild user is not available");

    const guildUserRoles = guildUser.roles.cache;
    const guildUserRoleIds = guildUserRoles.map((role) => role.id);

    const canManageRole = config.some(
      (managedRole) =>
        managedRole.roleId === roleId &&
        guildUserRoleIds.includes(managedRole.managerId.toString())
    );

    if (!canManageRole) {
      return interaction.editReply({
        content: "You can't manage this role",
      });
    }

    const targetUser = await interaction.guild?.members.fetch(user.id);

    if (!targetUser) {
      return interaction.editReply({
        content: localizedReply(interaction, "User not found", {
          pl: "Użytkownik nie znaleziony",
        }),
      });
    }

    if (subcommand === "add") {
      if (targetUser.roles.cache.has(roleId.toString())) {
        return interaction.editReply({
          content: localizedReply(interaction, "User already has this role", {
            pl: "Użytkownik ma już tę rolę",
          }),
        });
      }
      await targetUser.roles.add(roleId.toString());
      await interaction.editReply({
        content: localizedReply(interaction, "Role added", {
          pl: "Rola dodana",
        }),
      });
    } else {
      if (!targetUser.roles.cache.has(roleId.toString())) {
        return interaction.editReply({
          content: localizedReply(interaction, "User doesn't have this role", {
            pl: "Użytkownik nie ma tej roli",
          }),
        });
      }
      await targetUser.roles.remove(roleId.toString());
      await interaction.editReply({
        content: localizedReply(interaction, "Role removed", {
          pl: "Rola usunięta",
        }),
      });
    }
  }

  public async autocompleteRun(interaction: Command.AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true);
    assert(interaction.guildId, "Guild ID is not available");
    const guildId = BigInt(interaction.guildId);

    if (focusedOption.name === "role") {
      const config = await getManagedRolesConfig(guildId);
      // Fetch user roles from discord
      const guildUser = await interaction.guild?.members.fetch(
        interaction.user.id
      );
      const guildRoles = await interaction.guild?.roles.fetch();
      assert(guildUser, "Guild user is not available");
      assert(guildRoles, "Guild roles are not available");
      const guildUserRoles = guildUser.roles.cache;
      const guildUserRoleIds = guildUserRoles.map((role) => role.id);
      return interaction.respond(
        config
          .filter((role) =>
            guildUserRoleIds.includes(role.managerId.toString())
          )
          .map((role) => ({
            name:
              guildRoles.find(
                (guildRole) => guildRole.id === role.roleId.toString()
              )?.name ||
              localizedReply(interaction, "Unknown role", {
                pl: `Nieznana rola (${role.roleId})`,
              }),
            value: role.roleId.toString(),
          }))
      );
    }
  }
}
