import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { prisma } from "@/lib/services/prisma";

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // TODO: Add password reset functionality
  },
  emailVerification: {
    sendOnSignUp: false,
    async sendVerificationEmail({ user, url }) {
      resend.emails
        .send({
          from: "onboarding@resend.dev",
          to: user.email,
          subject: "Verify your email!",
          html: `<p><a href=${url} target="_blank">Click here.</a> to verify your email</p>`,
        })
        .catch((error) => {
          console.error("Failed to send verification email:", error);
        });
    },
  },
});
