import { cookies } from "next/headers";
import { cache } from "react";

import type { Session, User } from "lucia";
import { lucia } from "../auth";

export const validateRequest = cache(
 async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
  const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
   return {
    user: null,
    session: null
   };
  }

  //console.log('🔥 session validated');

  const result = await lucia.validateSession(sessionId);
  try {
   if (result?.session?.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
   }
   if (!result.session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
   }
  } catch {}
  return result;
 }
);