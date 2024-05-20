import { container } from "@sapphire/pieces";

export async function getTicketsConfig(guildId: bigint) {
  const res = await container.db.ticketConfig.findUnique({
    select: {
      guildId: true,
      enabled: true,
      categoryId: true,
      ticketCreatedMessage: true,
    },
    where: {
      guildId,
    },
  });

  return res;
}
