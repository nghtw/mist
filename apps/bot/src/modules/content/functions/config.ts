import { container } from "@sapphire/pieces";



// obecne obslugiwany jest tylko jeden kanał
export async function getChannelWithEnabledContentFetching() {
  const config = await container.db.contentChannelConfig.findFirst({
    where: {
      enabled: true,
    },
    select: {
    channelId: true,
    },
  });

  return config

}
