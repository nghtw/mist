import { generateState } from "arctic";
import { github } from "~/lib/oauth";
import { cookies } from "next/headers";
import { globalGETRateLimit } from "~/lib/request";

export async function GET(): Promise<Response> {
    if (!await globalGETRateLimit()) {
		return new Response("Too many requests", {
            status: 429
        }) 
	}
	const state = generateState();
	const url = github.createAuthorizationURL(state, ["user:email"]);

	(await cookies()).set("github_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}