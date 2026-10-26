export const dynamic = 'force-dynamic';
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { LivePipelineTracker } from "@/components/LivePipelineTracker";
import Link from "next/link";
import { Package, FileCheck, Clock, CheckCircle } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [total, pending, testing, completed, rejected] = await Promise.all([
    prisma.sample.count(),
    prisma.sample.count({ where: { status: { in: ["OFFER_SUBMITTED", "BRANCH_REVIEW", "BRANCH_APPROVED", "FRL_ASSIGNED", "FIELD_SAMPLING"] } } }),
    prisma.sample.count({ where: { status: { in: ["SAMPLE_RECEIVED_FRL", "TESTING_IN_PROGRESS"] } } }),
    prisma.sample.count({ where: { status: { in: ["REPORT_GENERATED", "REPORT_COMMUNICATED"] } } }),
    prisma.sample.count({ where: { status: "REJECTED" } }),
  ]);

  const recent = await prisma.sample.findMany({
    take: 12,
    orderBy: { receivedAt: "desc" },
    include: {
      sampleOffer: { include: { supplier: { select: { companyName: true } } } },
      crossSample: { include: { godownManager: { select: { godownName: true } } } },
      fieldRecord: { include: { assignedTo: { select: { name: true } } } },
      qcReport: true,
    },
  });

  const pipeline = await prisma.$queryRaw<{ status: string; count: bigint }[]>`
    SELECT status, COUNT(*) as count FROM "Sample" GROUP BY status ORDER BY count DESC
  `;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: "-0.224px", marginBottom: 4 }}>GSCSCL — QC System</p>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", lineHeight: 1.1, color: "#1d1d1f", margin: 0 }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 24, fontWeight: 300, color: "#7a7a7a", marginTop: 8, lineHeight: 1.5 }}>
          End-to-end pipeline monitoring.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Samples" value={total} icon={<Package size={24} />} color="#1d1d1f" />
        <StatCard label="In Pipeline" value={pending} color="#0066cc" icon={<Clock size={24} />} sub="Offer → Field" />
        <StatCard label="Under Testing" value={testing} color="#ff9500" icon={<Clock size={24} />} sub="Lab stage" />
        <StatCard label="Completed" value={completed} color="#34c759" icon={<CheckCircle size={24} />} sub="Reports sent" />
        <StatCard label="Rejected" value={rejected} color="#ff3b30" icon={<FileCheck size={24} />} />
      </div>

      {/* Live SSE Pipeline Tracker */}
      <div style={{ marginBottom: 32 }}>
        <LivePipelineTracker />
      </div>

      {/* Pipeline Distribution (server-rendered static) */}
      <div style={{ background: "#272729", borderRadius: 18, padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: 21, fontWeight: 600, color: "#fff", marginBottom: 24, letterSpacing: "0.231px" }}>
          Pipeline Distribution
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {pipeline.map((p) => (
            <div key={p.status} style={{
              background: "#3a3a3c",
              borderRadius: 11,
              padding: "12px 16px",
              minWidth: 140,
            }}>
              <div style={{ fontSize: 10, color: "#7a7a7a", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                {p.status.replace(/_/g, " ")}
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>
                {Number(p.count)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Samples Table */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", color: "#1d1d1f" }}>
            Recent Samples
          </h3>
          <Link href="/dashboard/admin/samples" style={{ fontSize: 14, color: "#0066cc", textDecoration: "none" }}>
            View all →
          </Link>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ background: "#f5f5f7" }}>
              {["Sample Code", "Type", "Commodity", "Source", "Assigned To", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a7a7a", letterSpacing: "-0.12px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "#1d1d1f", fontFamily: "monospace" }}>
                  {s.sampleCode}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>
                  {s.sampleType === "SUPPLIER_INITIATED" ? "Supplier" : "Cross"}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 13, color: "#1d1d1f" }}>
                  {s.sampleOffer?.commodityName ?? s.crossSample?.commodityName ?? "—"}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>
                  {s.sampleOffer?.supplier.companyName ?? s.crossSample?.godownManager?.godownName ?? "—"}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>
                  {s.fieldRecord?.assignedTo?.name ?? "—"}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <StatusBadge status={s.status} size="sm" />
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <Link href={`/dashboard/admin/samples/${s.id}`} style={{ fontSize: 13, color: "#0066cc", textDecoration: "none" }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
