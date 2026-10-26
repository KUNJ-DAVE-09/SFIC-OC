"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { UserRole } from "@prisma/client";

const NAV_ITEMS: Record<UserRole, { label: string; href: string }[]> = {
  SUPPLIER: [
    { label: "Dashboard", href: "/dashboard/supplier" },
    { label: "Submit Offer", href: "/dashboard/supplier/new-offer" },
    { label: "My Samples", href: "/dashboard/supplier/samples" },
  ],
  CGP_BRANCH: [
    { label: "Dashboard", href: "/dashboard/branch" },
    { label: "Pending Review", href: "/dashboard/branch/review" },
    { label: "All Samples", href: "/dashboard/branch/samples" },
  ],
  TOC_BRANCH: [
    { label: "Dashboard", href: "/dashboard/branch" },
    { label: "Pending Review", href: "/dashboard/branch/review" },
    { label: "All Samples", href: "/dashboard/branch/samples" },
  ],
  QC_BRANCH: [
    { label: "Dashboard", href: "/dashboard/qc" },
    { label: "Assign FRL", href: "/dashboard/qc/assign" },
    { label: "Cross Sampling", href: "/dashboard/qc/cross-sampling" },
    { label: "All Samples", href: "/dashboard/qc/samples" },
  ],
  FRL_FIELD: [
    { label: "Dashboard", href: "/dashboard/field" },
    { label: "My Assignments", href: "/dashboard/field/assignments" },
  ],
  FRL_LAB: [
    { label: "Dashboard", href: "/dashboard/lab" },
    { label: "Pending Tests", href: "/dashboard/lab/pending" },
    { label: "All Records", href: "/dashboard/lab/records" },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Pipeline", href: "/dashboard/admin/pipeline" },
    { label: "All Samples", href: "/dashboard/admin/samples" },
    { label: "Users", href: "/dashboard/admin/users" },
  ],
};

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role as UserRole | undefined;
  const items = role ? NAV_ITEMS[role] ?? [] : [];

  return (
    <nav style={{ background: "#000", height: 44 }} className="fixed top-0 left-0 right-0 z-50 flex items-center px-6">
      <div className="flex items-center gap-2 mr-8">
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: "-0.2px" }}>
          SFIC QC
        </span>
        <span style={{ color: "#7a7a7a", fontSize: 12 }}>|</span>
        <span style={{ color: "#7a7a7a", fontSize: 12 }}>GSCSCL</span>
      </div>

      <div className="flex items-center gap-6 flex-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              color: pathname === item.href ? "#fff" : "#999",
              fontSize: 12,
              letterSpacing: "-0.12px",
              textDecoration: "none",
              fontWeight: pathname === item.href ? 600 : 400,
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {session && (
        <div className="flex items-center gap-4">
          <Link href="/dashboard/notifications">
            <Bell size={16} color="#fff" />
          </Link>
          <div className="flex items-center gap-2">
            <User size={14} color="#999" />
            <span style={{ color: "#999", fontSize: 12 }}>{session.user.name}</span>
            <span
              style={{
                background: "#1d1d1f",
                color: "#999",
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 8,
                letterSpacing: "-0.08px",
              }}
            >
              {role ? ROLE_LABELS[role] : ""}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <LogOut size={14} color="#999" />
          </button>
        </div>
      )}
    </nav>
  );
}
