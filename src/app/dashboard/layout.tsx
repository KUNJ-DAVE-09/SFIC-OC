import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      <Navbar />
      <main style={{ paddingTop: 44 }}>{children}</main>
    </div>
  );
}
