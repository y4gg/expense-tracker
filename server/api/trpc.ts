import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/lib/auth";

type CreateContextOptions = {
  headers: Headers;
};

export async function createContext({ headers }: CreateContextOptions) {
  const session = await auth.api.getSession({ headers });

  return {
    session,
    headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
