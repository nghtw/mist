"use server";

import { getCurrentSession } from "~/lib/session";
import { actionClient } from "../../lib/safe-action";
import { db } from "../db";
import { Role } from "@mist/database";

export const getTags = actionClient.action(async () => {

    //TODO move auth to middleware in safe actions
    const { session, user } = await getCurrentSession();

    if(!user || user?.role !== Role.ADMIN || !session) {
      return null;
    }


  const tags = await db.contentTag.findMany({
    select: {
        id: true,
        name: true,
        emoji: true,
    },
  });


  return tags;
});
