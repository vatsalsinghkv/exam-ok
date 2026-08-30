import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendResetPassword({ user, url }) {
      resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Reset your password",
        html: `<p><a href=${url} target="_blank">Click here.</a> to reset your email</p>`,
      });
    },
    async onPasswordReset({ user }) {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
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
