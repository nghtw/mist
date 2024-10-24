import { db } from "~/server/db";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { cache } from "react";
import { cookies } from "next/headers";

import type { User } from "./user";

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    
    const sessionData = await db.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
    });

    if (!sessionData) {
        return { session: null, user: null };
    }

    const session: Session = {
        id: sessionData.id,
        userId: sessionData.userId,
        expiresAt: sessionData.expiresAt
    };

    const user: User = {
        id: sessionData.user.id,
        githubId: sessionData.user.githubId as number,  
        email: sessionData.user.email as string || '' ,
        username: sessionData.user.username ?? ''
    };

    if (Date.now() >= session.expiresAt.getTime()) {
        await db.session.delete({ where: { id: session.id } });
        return { session: null, user: null };
    }

    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db.session.update({
            where: { id: session.id },
            data: { expiresAt: session.expiresAt }
        });
    }

    return { session, user };
}


export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
    const token = (await cookies()).get("session")?.value ?? null;
    if (token === null) {
        return { session: null, user: null };
    }

    return await validateSessionToken(token);
});

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.session.delete({
        where: { id: sessionId }
    });
}

export async function invalidateUserSessions(userId: number): Promise<void> {
    await db.session.deleteMany({
        where: { userId }
    });
}

export async function setSessionTokenCookie(token: string, expiresAt: Date) {
    (await cookies()).set("session", token, {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt
    });
}

export async function deleteSessionTokenCookie() {
    (await cookies()).set("session", "", {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0
    });
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32(tokenBytes).toLowerCase();
	return token;
}

export async function createSession(token: string, userId: number): Promise<Session> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    const session = await db.session.create({
        data: {
            id: sessionId,
            userId,
            expiresAt
        }
    });

    return {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt
    };
}

export interface Session {
	id: string;
	expiresAt: Date;
	userId: number;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };