import { container } from "@sapphire/pieces";

export async function getManagedRolesConfig(guildId: bigint) {
  const res = await container.db.managedRoleConfig.findMany({
    select: {
      guildId: true,
      roleId: true,
      managerId: true,
    },
    where: {
      guildId,
      enabled: true,
    },
  });

  return res;
}
