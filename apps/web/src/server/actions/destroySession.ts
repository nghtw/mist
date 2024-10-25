"use server";

import { getCurrentSession, invalidateUserSessions } from "~/lib/session";
import { actionClient } from "../../lib/safe-action";


export const destroySession = actionClient.action(async () => {

    //TODO move auth to middleware in safe actions
    const { session, user } = await getCurrentSession();

    if(!user || !session) {
      return 'Unauthorized';
    }

    await invalidateUserSessions(user.id);


  return true;
});
