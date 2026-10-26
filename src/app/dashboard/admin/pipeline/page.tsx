export const dynamic = 'force-dynamic';
import { LivePipelineTracker } from "@/components/LivePipelineTracker";
import { auth } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";

export default async function PipelinePage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const samples = await prisma.sample.findMany({
    orderBy: { receivedAt: "desc" },
    include: {
      sampleOffer: { include: { supplier: { select: { companyName: true } } } },
      crossSample: { include: { godownManager: { select: { godownName: true } } } },
      fieldRecord: { include: { assignedTo: { select: { name: true } } } },
    },
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 14, color: "#7a7a7a", marginBottom: 4 }}>Admin — Real-time</p>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", lineHeight: 1.1, margin: 0 }}>
          Pipeline Monitor
        </h1>
      </div>

      <div style={{ marginBottom: 32 }}>
        <LivePipelineTracker />
      </div>

      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 0" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px" }}>All Samples ({samples.length})</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ background: "#f5f5f7" }}>
              {["Code", "Type", "Commodity", "Source", "Field Staff", "Received", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a7a7a" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 20px", fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{s.sampleCode}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{s.sampleType === "SUPPLIER_INITIATED" ? "Supplier" : "Cross"}</td>
                <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600 }}>{s.sampleOffer?.commodityName ?? s.crossSample?.commodityName ?? "—"}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{s.sampleOffer?.supplier.companyName ?? s.crossSample?.godownManager?.godownName ?? "—"}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{s.fieldRecord?.assignedTo?.name ?? "—"}</td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>{new Date(s.receivedAt).toLocaleDateString("en-IN")}</td>
                <td style={{ padding: "12px 20px" }}><StatusBadge status={s.status} size="sm" /></td>
                <td style={{ padding: "12px 20px" }}>
                  <Link href={`/dashboard/admin/samples/${s.id}`} style={{ fontSize: 13, color: "#0066cc", textDecoration: "none" }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
