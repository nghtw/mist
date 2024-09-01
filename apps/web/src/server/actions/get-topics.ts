"use server";

//import { z } from "zod";
import { actionClient } from "../../lib/safe-action";



export const getTopics = actionClient
 // .schema(schema)
  .action(async () => {

    const tempData = [
        {
          id: "m5gr84i9",
          tags: ['smoki'],
          topic: "Zwiększe ilości lootu",
          nickname: "Żubr",
        },
        {
          id: "3u1reuv4",
          tags: ['nowe'],
          topic: "Dodanie nowego wariantu",
          nickname: "Bóbr",
        },
        {
          id: "derv1ws0",
          tags: ['wyprawy'],
          topic: "Wipe bety",
          nickname: "Łoś",
        },
        {
          id: "5kma53ae",
          tags: ['smoki','wyprawy'],
          topic: "Placeholder topic",
          nickname: "Lis",
        },
        {
          id: "bhqecj4p",
          tags: ['smoki','nowe'],
          topic: "Placeholder topic",
          nickname: "Wilk",
        },
        {
          id: "bhqecj4s",
          tags: ['smoki','nowe'],
          topic: "Placeholder topic",
          nickname: "Kuna",
        },
        {
          id: "bhqecj4c",
          tags: ['smoki','walka'],
          topic: "Placeholder topic",
          nickname: "Koń",
        },
      ];


    return tempData;

  });