"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const ROLE_HOME: Record<string, string> = {
  SUPPLIER: "/dashboard/supplier",
  CGP_BRANCH: "/dashboard/branch",
  TOC_BRANCH: "/dashboard/branch",
  QC_BRANCH: "/dashboard/qc",
  FRL_FIELD: "/dashboard/field",
  FRL_LAB: "/dashboard/lab",
  ADMIN: "/dashboard/admin",
};

export default function HomePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      window.location.replace("/login");
      return;
    }
    if (session?.user?.role) {
      window.location.replace(ROLE_HOME[session.user.role] ?? "/dashboard/admin");
    }
  }, [status, session]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 600, color: "#fff", letterSpacing: "-0.28px" }}>SFIC QC</div>
        <div style={{ fontSize: 14, color: "#7a7a7a", marginTop: 8 }}>Loading...</div>
      </div>
    </div>
  );
}
