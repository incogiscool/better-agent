import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return session.user;
}
