// src/actions/getThreadComments.ts
"use server";

import { z } from "zod";
import { actionClient } from "../../lib/safe-action";
import { db } from "../db";
import { getCurrentSession } from "~/lib/session";
import { Role } from "@mist/database";


const getThreadCommentsSchema = z.object({
  threadId: z.string().refine((val) => {

    try {
      BigInt(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "threadId must be a valid bigint string",
  }),
});

export const getThreadComments = actionClient
  .schema(getThreadCommentsSchema)
  .action(async ({ parsedInput }) => {


  //TODO move auth to middleware in safe actions
  const { session, user } = await getCurrentSession();

  if(!user || user?.role !== Role.ADMIN || !session) {
    return null;
  }

    const { threadId } = parsedInput;
    const threadIdBigInt = BigInt(threadId); 

   
    const comments = await db.contentComments.findMany({
      where: { threadId: threadIdBigInt },
      select: {
        id: true,
        content: true,
        author: true,
        createdAt: true,
        updatedAt: true,
        ContentCommentReactions: { 
          select: {
            emoji: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' }, 
    });

    return comments;
  });
