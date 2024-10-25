import type { Role } from "@mist/database";
import { db } from "~/server/db";

export async function createUser(githubId: number, email: string, username: string): Promise<User> {
    try {
      const user = await db.user.create({
        data: {
          githubId,
          email,
          username
        }
      });
      return user;
    } catch (error) {
	  if (error instanceof Error) {
		throw new Error("Unexpected error: " + error.message);
	  } else {
		throw new Error("Unexpected error");
	  }
    }
  }

  export async function getUserFromGitHubId(githubId: number): Promise<User | null> {
    const user = await db.user.findUnique({
      where: {
        githubId
      }
    });
  
    if (!user) {
      return null;
    }
  
    return user;
  }

export interface User {
	id: number;
	email: string;
	githubId: number;
	username: string;
  role: Role;
}