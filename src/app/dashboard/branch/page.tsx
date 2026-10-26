export const dynamic = 'force-dynamic';
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { ClipboardCheck, Clock, CheckCircle } from "lucide-react";

export default async function BranchDashboard() {
  const session = await auth();
  if (!session || !["CGP_BRANCH", "TOC_BRANCH"].includes(session.user.role)) redirect("/login");

  const category = session.user.role === "CGP_BRANCH" ? "CGP" : "TOC";

  const approved = await prisma.sample.count({ where: { category, status: { in: ["BRANCH_APPROVED", "FRL_ASSIGNED"] } } });

  const pendingOffers = await prisma.sampleOffer.findMany({
    where: { category, status: { in: ["OFFER_SUBMITTED", "BRANCH_REVIEW"] } },
    orderBy: { createdAt: "asc" },
    include: { supplier: { include: { user: { select: { name: true } } } }, sample: true },
  });

  const samples = await prisma.sample.findMany({
    where: { category },
    take: 15,
    orderBy: { receivedAt: "desc" },
    include: {
      sampleOffer: { include: { supplier: { select: { companyName: true } } } },
      crossSample: true,
    },
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: "-0.224px", marginBottom: 4 }}>
          {session.user.role === "CGP_BRANCH" ? "Coarse Grain & Pulses Branch" : "Textile & Other Commodities Branch"}
        </p>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", lineHeight: 1.1, color: "#1d1d1f", margin: 0 }}>
          Branch Dashboard
        </h1>
        <p style={{ fontSize: 24, fontWeight: 300, color: "#7a7a7a", marginTop: 8 }}>
          Review and approve incoming sample offers.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Pending Review" value={pendingOffers.length} color="#ff9500" icon={<Clock size={24} />} sub="Awaiting approval" />
        <StatCard label="Forwarded to FRL" value={approved} color="#0066cc" icon={<ClipboardCheck size={24} />} />
        <StatCard label="Total Samples" value={samples.length} color="#1d1d1f" icon={<CheckCircle size={24} />} />
      </div>

      {/* Pending Review Queue */}
      {pendingOffers.length > 0 && (
        <div style={{ background: "#272729", borderRadius: 18, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 21, fontWeight: 600, color: "#fff", marginBottom: 20, letterSpacing: "0.231px" }}>
            🔴 Pending Review ({pendingOffers.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pendingOffers.map((o) => (
              <div key={o.id} style={{
                background: "#3a3a3c",
                borderRadius: 11,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{o.commodityName}</div>
                  <div style={{ fontSize: 12, color: "#cccccc", marginTop: 2 }}>
                    {o.supplier.companyName} · {o.quantity} {o.unit} · {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </div>
                  <div style={{ fontSize: 11, color: "#7a7a7a", marginTop: 2 }}>{o.offerNumber}</div>
                </div>
                {o.sample && (
                  <Link href={`/dashboard/branch/review/${o.sample.id}`} style={{
                    background: "#0066cc",
                    color: "#fff",
                    borderRadius: 9999,
                    padding: "8px 16px",
                    fontSize: 14,
                    textDecoration: "none",
                    flexShrink: 0,
                  }}>
                    Review →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Samples */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 0" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px" }}>All Samples — {category}</h3>
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
            {samples.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 20px", fontSize: 12, fontFamily: "monospace" }}>{s.sampleCode}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{s.sampleType === "SUPPLIER_INITIATED" ? "Supplier" : "Cross"}</td>
                <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600 }}>{s.sampleOffer?.commodityName ?? s.crossSample?.commodityName}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{s.sampleOffer?.supplier.companyName ?? "Godown"}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                <td style={{ padding: "12px 20px" }}><StatusBadge status={s.status} size="sm" /></td>
                <td style={{ padding: "12px 20px" }}>
                  <Link href={`/dashboard/branch/samples/${s.id}`} style={{ fontSize: 13, color: "#0066cc", textDecoration: "none" }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
