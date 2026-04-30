import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CookieOptions = Parameters<ReturnType<typeof NextResponse.next>["cookies"]["set"]>[2];
type CookieToSet = { name: string; value: string; options?: CookieOptions };

export const createClient = async () => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                async getAll() {
                    const cookieStore = await cookies();
                    return cookieStore.getAll();
                },
                async setAll(cookiesToSet: CookieToSet[]) {
                    try {
                        const cookieStore = await cookies();
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                }
            },
        }
    );
};