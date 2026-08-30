"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";

export default function Home() {
  const router = useRouter();
  const { data, isPending } = useSession();
  const user = data?.user;
  console.dir(data);
  console.dir({ isPending });
  return (
    <main className="flex items-center justify-center h-screen bg-neutral-950 text-white">
      <h1>User: {user?.name}</h1>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.push("/sign-up")}
          className="bg-white text-black font-medium px-6 py-2 rounded-md hover:bg-gray-200"
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => router.push("/sign-in")}
          className="border border-white text-white font-medium px-6 py-2 rounded-md hover:bg-neutral-800"
        >
          Sign In
        </button>
      </div>
    </main>
  );
}
