export const dynamic = 'force-dynamic';
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { Users, Plus } from "lucide-react";

export default async function QCDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "QC_BRANCH") redirect("/login");

  const frlFieldStaff = await prisma.user.findMany({ where: { role: "FRL_FIELD", isActive: true } });
  const crossSamples = await prisma.crossSample.findMany({
    take: 5,
    orderBy: [{ createdAt: "desc" }],
    include: { godownManager: { include: { user: { select: { name: true } } } } },
  });
  const needsAssignment = await prisma.sample.findMany({
    where: { status: "BRANCH_APPROVED" },
    include: {
      sampleOffer: { include: { supplier: { select: { companyName: true } } } },
      crossSample: true,
    },
    orderBy: { receivedAt: "asc" },
  });
  const allSamples = await prisma.sample.findMany({
    take: 20,
    orderBy: { receivedAt: "desc" },
    include: {
      sampleOffer: { include: { supplier: { select: { companyName: true } } } },
      crossSample: true,
    },
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 14, color: "#7a7a7a", marginBottom: 4 }}>QC Branch</p>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", lineHeight: 1.1, color: "#1d1d1f", margin: 0 }}>
          QC Branch Dashboard
        </h1>
        <p style={{ fontSize: 24, fontWeight: 300, color: "#7a7a7a", marginTop: 8 }}>
          Assign FRL staff, manage cross-sampling, and oversee the pipeline.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Needs FRL Assignment" value={needsAssignment.length} color="#ff9500" icon={<Users size={24} />} sub="Branch approved" />
        <StatCard label="Cross Samples Active" value={crossSamples.length} color="#5856d6" />
        <StatCard label="Total Pipeline" value={allSamples.length} color="#1d1d1f" />
      </div>

      {/* FRL Assignment Queue */}
      {needsAssignment.length > 0 && (
        <div style={{ background: "#272729", borderRadius: 18, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 21, fontWeight: 600, color: "#fff", marginBottom: 20, letterSpacing: "0.231px" }}>
            🟡 Assign FRL Field Staff ({needsAssignment.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {needsAssignment.map((s) => (
              <div key={s.id} style={{
                background: "#3a3a3c",
                borderRadius: 11,
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                    {s.sampleOffer?.commodityName ?? s.crossSample?.commodityName}
                  </div>
                  <div style={{ fontSize: 12, color: "#cccccc", marginTop: 2 }}>
                    {s.sampleCode} · {s.sampleOffer?.supplier.companyName ?? "Cross Sample"}
                  </div>
                </div>
                <Link href={`/dashboard/qc/assign/${s.id}`} style={{
                  background: "#ff9500",
                  color: "#fff",
                  borderRadius: 9999,
                  padding: "8px 16px",
                  fontSize: 13,
                  textDecoration: "none",
                  flexShrink: 0,
                }}>
                  Assign FRL →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross Sampling CTA */}
      <div style={{
        background: "#f5f5f7",
        border: "1px solid #e0e0e0",
        borderRadius: 18,
        padding: 24,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f", margin: 0 }}>Cross-Sampling</h3>
          <p style={{ fontSize: 14, color: "#7a7a7a", marginTop: 4 }}>
            Initiate a new godown cross-sampling request.
          </p>
        </div>
        <Link href="/dashboard/qc/cross-sampling" style={{
          background: "#0066cc",
          color: "#fff",
          borderRadius: 9999,
          padding: "11px 22px",
          fontSize: 17,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <Plus size={16} />
          New Cross Sample
        </Link>
      </div>

      {/* All samples table */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 0" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px" }}>All Samples</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ background: "#f5f5f7" }}>
              {["Code", "Type", "Commodity", "Source", "Date", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a7a7a" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allSamples.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 20px", fontSize: 12, fontFamily: "monospace" }}>{s.sampleCode}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{s.sampleType === "SUPPLIER_INITIATED" ? "Supplier" : "Cross"}</td>
                <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600 }}>{s.sampleOffer?.commodityName ?? s.crossSample?.commodityName}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{s.sampleOffer?.supplier.companyName ?? "Godown"}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                <td style={{ padding: "12px 20px" }}><StatusBadge status={s.status} size="sm" /></td>
                <td style={{ padding: "12px 20px" }}>
                  <Link href={`/dashboard/qc/samples/${s.id}`} style={{ fontSize: 13, color: "#0066cc", textDecoration: "none" }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FRL Staff list */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", marginBottom: 16 }}>FRL Field Staff</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {frlFieldStaff.map((u) => (
            <div key={u.id} style={{
              background: "#f5f5f7",
              borderRadius: 11,
              padding: "8px 16px",
              fontSize: 13,
              color: "#1d1d1f",
              fontWeight: 600,
            }}>
              {u.name}
              <span style={{ fontSize: 11, color: "#7a7a7a", fontWeight: 400, marginLeft: 6 }}>{u.email}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
