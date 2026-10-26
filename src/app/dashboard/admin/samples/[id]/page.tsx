export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { PipelineTracker } from "@/components/PipelineTracker";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/Card";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminSampleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sample = await prisma.sample.findUnique({
    where: { id },
    include: {
      sampleOffer: { include: { supplier: { include: { user: { select: { name: true, email: true } } } } } },
      crossSample: { include: { godownManager: { include: { user: { select: { name: true } } } } } },
      fieldRecord: { include: { assignedTo: { select: { name: true, email: true } } } },
      labRecord: true,
      qcReport: true,
      workflowActions: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, role: true } } },
      },
    },
  });
  if (!sample) notFound();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/dashboard/admin" style={{ fontSize: 13, color: "#0066cc", textDecoration: "none" }}>← Admin</Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.374px", margin: 0 }}>{sample.sampleCode}</h1>
        <StatusBadge status={sample.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Offer details */}
          {sample.sampleOffer && (
            <Card title="Sample Offer">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
                {[
                  ["Offer No.", sample.sampleOffer.offerNumber],
                  ["Commodity", sample.sampleOffer.commodityName],
                  ["Category", sample.sampleOffer.category],
                  ["Quantity", `${sample.sampleOffer.quantity} ${sample.sampleOffer.unit}`],
                  ["Batch", sample.sampleOffer.batchNumber],
                  ["Supplier", sample.sampleOffer.supplier.companyName],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: "#7a7a7a", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Field record */}
          {sample.fieldRecord && (
            <Card title="Field Sampling Record">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
                {[
                  ["Assigned To", sample.fieldRecord.assignedTo.name],
                  ["Visit Date", sample.fieldRecord.visitDate ? new Date(sample.fieldRecord.visitDate).toLocaleDateString("en-IN") : "Pending"],
                  ["Seal No.", sample.fieldRecord.sealNumber ?? "—"],
                  ["Weight", sample.fieldRecord.sampleWeightKg ? `${sample.fieldRecord.sampleWeightKg} kg` : "—"],
                  ["Submitted to Lab", sample.fieldRecord.submittedToLab ? "Yes" : "No"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: "#7a7a7a", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Lab results */}
          {sample.labRecord && (
            <Card title="Laboratory Test Record">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "#7a7a7a" }}>Lab Code: {sample.labRecord.labSampleCode ?? "—"}</span>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: sample.labRecord.overallResult === "PASS" ? "#34c759" : sample.labRecord.overallResult === "FAIL" ? "#ff3b30" : "#ff9500",
                }}>
                  {sample.labRecord.overallResult}
                </span>
              </div>
              {Array.isArray(sample.labRecord.testParameters) && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f5f5f7" }}>
                      {["Parameter", "Expected", "Actual", "Result"].map((h) => (
                        <th key={h} style={{ padding: "6px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a7a7a" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(sample.labRecord.testParameters as Array<{ param: string; expected: string; actual: string; result: string }>).map((p, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "6px 12px", fontSize: 13 }}>{p.param}</td>
                        <td style={{ padding: "6px 12px", fontSize: 12, color: "#7a7a7a" }}>{p.expected}</td>
                        <td style={{ padding: "6px 12px", fontSize: 13, fontWeight: 600 }}>{p.actual}</td>
                        <td style={{ padding: "6px 12px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: p.result === "PASS" ? "#34c759" : p.result === "FAIL" ? "#ff3b30" : "#ff9500" }}>
                            {p.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          {/* QC Report */}
          {sample.qcReport && (
            <div style={{
              background: sample.qcReport.result === "PASS" ? "#f0fdf4" : "#fff1f0",
              border: `1px solid ${sample.qcReport.result === "PASS" ? "#86efac" : "#ffccc7"}`,
              borderRadius: 18,
              padding: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>QC Report — {sample.qcReport.reportNumber}</h3>
                <span style={{ fontSize: 13, fontWeight: 700, color: sample.qcReport.result === "PASS" ? "#34c759" : "#ff3b30" }}>
                  {sample.qcReport.result}
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{sample.qcReport.summary}</p>
              {sample.qcReport.recommendations && (
                <p style={{ fontSize: 13, color: "#7a7a7a", marginTop: 8, marginBottom: 0 }}>{sample.qcReport.recommendations}</p>
              )}
            </div>
          )}

          {/* Audit log */}
          <Card title="Audit Trail">
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {sample.auditLogs.map((log) => (
                <div key={log.id} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                  <div style={{ fontSize: 11, color: "#7a7a7a", minWidth: 100, flexShrink: 0 }}>
                    {new Date(log.createdAt).toLocaleDateString("en-IN")}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>{log.user.name}</span>
                    <span style={{ color: "#7a7a7a", fontSize: 11, marginLeft: 4 }}>({log.user.role})</span>
                    <span style={{ color: "#1d1d1f", marginLeft: 6 }}>{log.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <PipelineTracker
            status={sample.status}
            workflowActions={sample.workflowActions.map((w) => ({ ...w, createdAt: w.createdAt.toISOString() }))}
          />
        </div>
      </div>
    </div>
  );
}
