// src/actions/upsertThreadNote.ts
'use server';

import { z } from "zod";
import { actionClient } from "~/lib/safe-action";
import { db } from "../db";
import { getCurrentSession } from "~/lib/session";
import { Role } from "@mist/database";

const upsertThreadNoteSchema = z.object({
  threadId: z.string().refine((val) => {
    try {
      BigInt(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "threadId musi być prawidłowym ciągiem BigInt",
  }),
  content: z.string().min(1, { message: "Content nie może być pusty" }),
});

export const upsertThreadNote = actionClient
  .schema(upsertThreadNoteSchema)
  .action(async ({ parsedInput }) => {
    const { session, user } = await getCurrentSession();

  
    if (!user || user.role !== Role.ADMIN || !session) {
      return null;
    }

    const { threadId, content } = parsedInput;
    const threadIdBigInt = BigInt(threadId);

    try {
    

      await db.contentThreads.update({
        where:{
          id: threadIdBigInt,
        },
        data:{
          note: content,
        }
      })

      return { success: true };
    } catch (error) {
      console.error("Błąd podczas aktualizacji notatki:", error);
      return { success: false, message: "Wystąpił błąd podczas zapisywania notatki" };
    }
  });
