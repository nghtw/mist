"use server";

import { getCurrentSession } from "~/lib/session";
import { actionClient } from "../../lib/safe-action";
import { db } from "../db";
import { Role } from "@mist/database";

export const getTopics = actionClient.action(async () => {


  //TODO move auth to middleware in safe actions
  const { session, user } = await getCurrentSession();

  if(!user || user?.role !== Role.ADMIN || !session) {
    return null;
  }

  console.log('user', user);  

  const threads = await db.contentThreads.findMany({
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: true,
      updatedAt: true,
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              emoji: true,
            },
          },
        },
      },
    },
  });

  if (!threads || threads.length === 0) {
    return [];
  }

  const processedThreads = threads.map((thread) => ({
    ...thread,
    tags: thread.tags.map((tagRelation) => ({
      name: tagRelation.tag.name,
      emoji: tagRelation.tag.emoji,
    })),
  }));

  return processedThreads;
});
