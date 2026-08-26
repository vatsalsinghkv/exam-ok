import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3001"],
});

export async function getUserServer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}
