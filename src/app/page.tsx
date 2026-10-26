export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  SUPPLIER: "/dashboard/supplier",
  CGP_BRANCH: "/dashboard/branch",
  TOC_BRANCH: "/dashboard/branch",
  QC_BRANCH: "/dashboard/qc",
  FRL_FIELD: "/dashboard/field",
  FRL_LAB: "/dashboard/lab",
  ADMIN: "/dashboard/admin",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role] ?? "/dashboard/admin");
  }
  redirect("/login");
}
