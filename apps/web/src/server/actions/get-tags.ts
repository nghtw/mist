"use server";

import { actionClient } from "../../lib/safe-action";
import { db } from "../db";

export const getTags = actionClient.action(async () => {
  const tags = await db.contentTag.findMany({
    select: {
        id: true,
        name: true,
        emoji: true,
    },
  });


  return tags;
});
