"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { Input, Button } from "@/components/FormElements";
import { UserRole } from "@prisma/client";

const ROLE_HOME: Record<UserRole, string> = {
  SUPPLIER: "/dashboard/supplier",
  CGP_BRANCH: "/dashboard/branch",
  TOC_BRANCH: "/dashboard/branch",
  QC_BRANCH: "/dashboard/qc",
  FRL_FIELD: "/dashboard/field",
  FRL_LAB: "/dashboard/lab",
  ADMIN: "/dashboard/admin",
};

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@gscscl.gov.in", password: "Admin@123", color: "#272729" },
  { label: "CGP Branch", email: "cgp.officer@gscscl.gov.in", password: "Branch@123", color: "#0066cc" },
  { label: "QC Branch", email: "qc.officer@gscscl.gov.in", password: "QC@Branch123", color: "#5856d6" },
  { label: "FRL Field", email: "frl.field@gscscl.gov.in", password: "FRL@Field123", color: "#ff9500" },
  { label: "FRL Lab", email: "frl.lab@gscscl.gov.in", password: "FRL@Lab123", color: "#34c759" },
  { label: "Supplier", email: "supplier@agrofresh.in", password: "Supplier@123", color: "#ff3b30" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res?.ok) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    // Get fresh session to read role
    const session = await getSession();
    const role = session?.user?.role as UserRole | undefined;
    const dest = role ? ROLE_HOME[role] : "/dashboard/admin";
    window.location.replace(dest);
  }

  function fillDemo(email: string, password: string) {
    setEmail(email);
    setPassword(password);
    setError("");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 12, color: "#7a7a7a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>GSCSCL</div>
        <h1 style={{ fontSize: 56, fontWeight: 600, letterSpacing: "-0.28px", lineHeight: 1.07, color: "#fff", margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}>
          QC Sampling
        </h1>
        <p style={{ fontSize: 24, fontWeight: 300, color: "#cccccc", lineHeight: 1.5, marginTop: 8 }}>
          Automated Quality Control &amp; Reporting System
        </p>
        <p style={{ fontSize: 14, color: "#7a7a7a", marginTop: 4 }}>Food, Civil Supplies &amp; Consumer Affairs Department · Gujarat</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 18, padding: 32, width: "100%", maxWidth: 400, border: "1px solid #e0e0e0" }}>
        <h2 style={{ fontSize: 21, fontWeight: 600, letterSpacing: "0.231px", marginBottom: 24, color: "#1d1d1f" }}>Sign In</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Email Address" type="email" placeholder="you@gscscl.gov.in"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && (
            <div style={{ fontSize: 13, color: "#ff3b30", background: "#fff1f0", padding: "8px 12px", borderRadius: 8 }}>{error}</div>
          )}
          <Button type="submit" loading={loading} size="lg" style={{ width: "100%", marginTop: 4 }}>
            Sign In
          </Button>
        </form>
      </div>

      <div style={{ marginTop: 32, width: "100%", maxWidth: 480 }}>
        <p style={{ fontSize: 12, color: "#7a7a7a", textAlign: "center", marginBottom: 12 }}>Demo accounts — click to auto-fill</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {DEMO_ACCOUNTS.map((acc) => (
            <button key={acc.email} onClick={() => fillDemo(acc.email, acc.password)}
              style={{ background: "#272729", border: "1px solid #3a3a3c", borderRadius: 11, padding: "8px 12px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: acc.color }}>{acc.label}</div>
              <div style={{ fontSize: 10, color: "#7a7a7a", marginTop: 2, wordBreak: "break-all" }}>{acc.email}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
