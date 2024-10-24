// src/components/providers/session-provider.tsx
'use client'


import type { Session } from "~/lib/session";
import type { User } from "~/lib/user";
import { createContext, useContext } from "react";

interface SessionData {
    user: User | null
    session: Session | null
  }

const SessionContext = createContext({} as SessionData)

interface SessionProviderProps {
  session: SessionData
  children: React.ReactNode
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}

export const useSession = () => useContext(SessionContext)