import { EmbedBuilder } from "discord.js";

export function createConfigEmbed(config: Record<string, string>) {
  let embed = new EmbedBuilder()
    .setTitle("Configuration")
    .setColor("#2f3136")
    .setTimestamp();

  for (const [key, value] of Object.entries(config)) {
    embed = embed.addFields({ name: key, value });
  }

  return embed;
}
