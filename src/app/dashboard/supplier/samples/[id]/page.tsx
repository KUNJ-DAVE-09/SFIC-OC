export const dynamic = 'force-dynamic';
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PipelineTracker } from "@/components/PipelineTracker";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/Card";

export default async function SupplierSampleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const sample = await prisma.sample.findUnique({
    where: { id },
    include: {
      sampleOffer: { include: { supplier: true } },
      fieldRecord: { include: { assignedTo: { select: { name: true } } } },
      labRecord: true,
      qcReport: true,
      workflowActions: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
    },
  });
  if (!sample || !session) notFound();

  const offer = sample.sampleOffer;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: "#7a7a7a", letterSpacing: "-0.12px" }}>
          Sample Tracking
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
          <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.374px", margin: 0 }}>
            {sample.sampleCode}
          </h1>
          <StatusBadge status={sample.status} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Offer Details */}
          {offer && (
            <Card title="Sample Offer Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
                {[
                  ["Offer Number", offer.offerNumber],
                  ["Commodity", offer.commodityName],
                  ["Category", offer.category],
                  ["Batch Number", offer.batchNumber],
                  ["Quantity", `${offer.quantity} ${offer.unit}`],
                  ["Mfg Date", offer.manufacturingDate ? new Date(offer.manufacturingDate).toLocaleDateString("en-IN") : "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: "#7a7a7a", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Field Sampling */}
          {sample.fieldRecord && (
            <Card title="Field Sampling">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
                {[
                  ["Assigned To", sample.fieldRecord.assignedTo.name],
                  ["Visit Date", sample.fieldRecord.visitDate ? new Date(sample.fieldRecord.visitDate).toLocaleDateString("en-IN") : "Pending"],
                  ["Seal Number", sample.fieldRecord.sealNumber ?? "—"],
                  ["Sample Weight", sample.fieldRecord.sampleWeightKg ? `${sample.fieldRecord.sampleWeightKg} kg` : "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: "#7a7a7a", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
              {sample.fieldRecord.observations && (
                <div style={{ marginTop: 12, padding: "12px 14px", background: "#f5f5f7", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#7a7a7a", marginBottom: 4 }}>Observations</div>
                  <p style={{ fontSize: 14, color: "#1d1d1f", margin: 0 }}>{sample.fieldRecord.observations}</p>
                </div>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", color: "#1d1d1f" }}>QC Report</h3>
                <span style={{
                  background: sample.qcReport.result === "PASS" ? "#34c759" : "#ff3b30",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "3px 12px",
                  borderRadius: 9999,
                }}>
                  {sample.qcReport.result}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#7a7a7a", marginTop: 4, marginBottom: 8 }}>
                Report No: {sample.qcReport.reportNumber}
              </div>
              <p style={{ fontSize: 14, color: "#1d1d1f", margin: 0, lineHeight: 1.6 }}>
                {sample.qcReport.summary}
              </p>
              {sample.qcReport.recommendations && (
                <p style={{ fontSize: 13, color: "#7a7a7a", marginTop: 8, marginBottom: 0 }}>
                  {sample.qcReport.recommendations}
                </p>
              )}
              <div style={{ fontSize: 11, color: "#7a7a7a", marginTop: 12 }}>
                Generated: {new Date(sample.qcReport.generatedAt).toLocaleDateString("en-IN")}
                {sample.qcReport.communicatedAt && ` · Communicated: ${new Date(sample.qcReport.communicatedAt).toLocaleDateString("en-IN")}`}
              </div>
            </div>
          )}

          {/* Lab Test Parameters */}
          {sample.labRecord && Array.isArray(sample.labRecord.testParameters) && (sample.labRecord.testParameters as unknown[]).length > 0 && (
            <Card title="Laboratory Test Results">
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
                <thead>
                  <tr style={{ background: "#f5f5f7" }}>
                    {["Parameter", "Expected", "Actual", "Unit", "Result"].map((h) => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a7a7a" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(sample.labRecord.testParameters as Array<{ param: string; expected: string; actual: string; unit: string; result: string }>).map((p, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 14px", fontSize: 13, fontWeight: 600 }}>{p.param}</td>
                      <td style={{ padding: "8px 14px", fontSize: 12, color: "#7a7a7a" }}>{p.expected}</td>
                      <td style={{ padding: "8px 14px", fontSize: 13, fontWeight: 600 }}>{p.actual}</td>
                      <td style={{ padding: "8px 14px", fontSize: 12, color: "#7a7a7a" }}>{p.unit}</td>
                      <td style={{ padding: "8px 14px" }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: p.result === "PASS" ? "#34c759" : p.result === "FAIL" ? "#ff3b30" : "#ff9500",
                          background: p.result === "PASS" ? "#f0fdf4" : p.result === "FAIL" ? "#fff1f0" : "#fff7ed",
                          padding: "2px 8px",
                          borderRadius: 9999,
                        }}>
                          {p.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {/* Pipeline sidebar */}
        <div>
          <PipelineTracker
            status={sample.status}
            workflowActions={sample.workflowActions.map((w) => ({
              ...w,
              createdAt: w.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
