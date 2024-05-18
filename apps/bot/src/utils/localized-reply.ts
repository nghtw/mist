import type { LocalizationMap } from "discord.js";

export function localizedReply(
  { locale }: { locale: keyof LocalizationMap },
  defaultString: string,
  strings: LocalizationMap
) {
  return strings[locale] ?? defaultString;
}
