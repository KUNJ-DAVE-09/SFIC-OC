export const dynamic = 'force-dynamic';
import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
        <Navbar />
        <main style={{ paddingTop: 44 }}>{children}</main>
      </div>
    </AuthGuard>
  );
}
