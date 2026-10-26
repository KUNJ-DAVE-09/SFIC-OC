export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";
import { UserRole } from "@prisma/client";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role as UserRole]);
  }
  redirect("/login");
}
