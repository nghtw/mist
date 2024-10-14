"use server";

import { actionClient } from "../../lib/safe-action";
import { db } from "../db";

export const getTopics = actionClient.action(async () => {
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
