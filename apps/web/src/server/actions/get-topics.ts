"use server";

//import { z } from "zod";
import { actionClient } from "../../lib/safe-action";
import { db } from "../db";



export const getTopics = actionClient
 // .schema(schema)
  .action(async () => {

    const threads = await db.contentThreads.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: true,
        updatedAt: true,
      }});

      if(!threads || Array.isArray(threads) && threads.length === 0) {
        return [];
      }



      return threads;


  });