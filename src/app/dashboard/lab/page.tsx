export const dynamic = 'force-dynamic';
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { FlaskConical, CheckCircle, Clock } from "lucide-react";

export default async function LabDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "FRL_LAB") redirect("/login");

  const completed = await prisma.sample.count({ where: { status: { in: ["REPORT_GENERATED", "REPORT_COMMUNICATED"] } } });

  const pending = await prisma.sample.findMany({
    where: { status: "SAMPLE_RECEIVED_FRL" },
    include: {
      sampleOffer: { include: { supplier: { select: { companyName: true } } } },
      crossSample: true,
    },
  });

  const testing = await prisma.sample.findMany({
    where: { status: "TESTING_IN_PROGRESS" },
    include: {
      sampleOffer: { include: { supplier: { select: { companyName: true } } } },
      crossSample: true,
      labRecord: true,
    },
  });

  const allRecords = await prisma.sample.findMany({
    take: 20,
    orderBy: { receivedAt: "desc" },
    include: {
      sampleOffer: { include: { supplier: { select: { companyName: true } } } },
      crossSample: true,
      labRecord: { select: { overallResult: true } },
    },
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 14, color: "#7a7a7a", marginBottom: 4 }}>FRL Laboratory</p>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", lineHeight: 1.1, color: "#1d1d1f", margin: 0 }}>
          Lab Dashboard
        </h1>
        <p style={{ fontSize: 24, fontWeight: 300, color: "#7a7a7a", marginTop: 8 }}>
          Receive samples, record tests, generate QC reports.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Awaiting Receipt" value={pending.length} color="#ff9500" icon={<Clock size={24} />} sub="Submitted by field" />
        <StatCard label="Testing In Progress" value={testing.length} color="#0066cc" icon={<FlaskConical size={24} />} />
        <StatCard label="Reports Generated" value={completed} color="#34c759" icon={<CheckCircle size={24} />} />
      </div>

      {/* Awaiting receipt */}
      {pending.length > 0 && (
        <div style={{ background: "#272729", borderRadius: 18, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 21, fontWeight: 600, color: "#fff", marginBottom: 20, letterSpacing: "0.231px" }}>
            🔴 Awaiting Lab Receipt ({pending.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((s) => (
              <div key={s.id} style={{ background: "#3a3a3c", borderRadius: 11, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                    {s.sampleOffer?.commodityName ?? s.crossSample?.commodityName}
                  </div>
                  <div style={{ fontSize: 12, color: "#cccccc", marginTop: 2 }}>
                    {s.sampleCode} · {s.sampleOffer?.supplier.companyName ?? "Cross Sample"}
                  </div>
                </div>
                <Link href={`/dashboard/lab/pending/${s.id}`} style={{ background: "#ff9500", color: "#fff", borderRadius: 9999, padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
                  Receive →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testing in progress */}
      {testing.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Testing In Progress</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {testing.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.sampleOffer?.commodityName ?? s.crossSample?.commodityName}</span>
                  <span style={{ fontSize: 12, color: "#7a7a7a", marginLeft: 8 }}>{s.sampleCode}</span>
                </div>
                <Link href={`/dashboard/lab/pending/${s.id}`} style={{ fontSize: 13, color: "#0066cc", textDecoration: "none" }}>
                  Enter Results →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All records */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 0" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px" }}>All Lab Records</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ background: "#f5f5f7" }}>
              {["Code", "Type", "Commodity", "Source", "Date", "Lab Result", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a7a7a" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRecords.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 20px", fontSize: 12, fontFamily: "monospace" }}>{s.sampleCode}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{s.sampleType === "SUPPLIER_INITIATED" ? "Supplier" : "Cross"}</td>
                <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600 }}>{s.sampleOffer?.commodityName ?? s.crossSample?.commodityName}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{s.sampleOffer?.supplier.companyName ?? "Godown"}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                <td style={{ padding: "12px 20px" }}>
                  {s.labRecord?.overallResult ? (
                    <span style={{ fontSize: 12, fontWeight: 600, color: s.labRecord.overallResult === "PASS" ? "#34c759" : s.labRecord.overallResult === "FAIL" ? "#ff3b30" : "#ff9500" }}>
                      {s.labRecord.overallResult}
                    </span>
                  ) : "—"}
                </td>
                <td style={{ padding: "12px 20px" }}><StatusBadge status={s.status} size="sm" /></td>
                <td style={{ padding: "12px 20px" }}>
                  <Link href={`/dashboard/lab/records/${s.id}`} style={{ fontSize: 13, color: "#0066cc", textDecoration: "none" }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
