export const dynamic = 'force-dynamic';
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { StatCard } from "@/components/Card";
import { MapPin, CheckCircle } from "lucide-react";

export default async function FieldDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "FRL_FIELD") redirect("/login");

  const assignments = await prisma.fieldSamplingRecord.findMany({
    where: { assignedToId: session.user.id },
    include: {
      sample: {
        include: {
          sampleOffer: { include: { supplier: { select: { companyName: true, address: true } } } },
          crossSample: { select: { commodityName: true, godownLocation: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = assignments.filter((a) => !a.submittedToLab);
  const done = assignments.filter((a) => a.submittedToLab);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 14, color: "#7a7a7a", marginBottom: 4 }}>FRL Field Staff</p>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", lineHeight: 1.1, color: "#1d1d1f", margin: 0 }}>
          My Assignments
        </h1>
        <p style={{ fontSize: 24, fontWeight: 300, color: "#7a7a7a", marginTop: 8 }}>
          Field sampling activities assigned to you.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <StatCard label="Pending Visits" value={pending.length} color="#ff9500" icon={<MapPin size={24} />} sub="Need field visit" />
        <StatCard label="Submitted to Lab" value={done.length} color="#34c759" icon={<CheckCircle size={24} />} />
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 21, fontWeight: 600, letterSpacing: "0.231px", marginBottom: 16 }}>
            Pending ({pending.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pending.map((a) => (
              <div key={a.id} style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 18,
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>
                      {a.sample.sampleOffer?.commodityName ?? a.sample.crossSample?.commodityName}
                    </span>
                    <StatusBadge status={a.sample.status} size="sm" />
                  </div>
                  <div style={{ fontSize: 12, color: "#7a7a7a" }}>
                    {a.sample.sampleCode} · {a.sample.sampleOffer?.supplier.companyName ?? "Cross Sample"}
                  </div>
                  {(a.sample.sampleOffer?.supplier.address ?? a.sample.crossSample?.godownLocation) && (
                    <div style={{ fontSize: 12, color: "#7a7a7a", marginTop: 2 }}>
                      📍 {a.sample.sampleOffer?.supplier.address ?? a.sample.crossSample?.godownLocation}
                    </div>
                  )}
                </div>
                <Link href={`/dashboard/field/assignments/${a.sampleId}`} style={{
                  background: "#0066cc",
                  color: "#fff",
                  borderRadius: 9999,
                  padding: "8px 16px",
                  fontSize: 13,
                  textDecoration: "none",
                  flexShrink: 0,
                }}>
                  Update →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <div>
          <h2 style={{ fontSize: 21, fontWeight: 600, letterSpacing: "0.231px", marginBottom: 16 }}>
            Submitted to Lab ({done.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {done.map((a) => (
              <div key={a.id} style={{
                background: "#f5f5f7",
                border: "1px solid #e0e0e0",
                borderRadius: 11,
                padding: "12px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {a.sample.sampleOffer?.commodityName ?? a.sample.crossSample?.commodityName}
                  </span>
                  <span style={{ fontSize: 12, color: "#7a7a7a", marginLeft: 8 }}>{a.sample.sampleCode}</span>
                </div>
                <StatusBadge status={a.sample.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "#7a7a7a" }}>
          <p style={{ fontSize: 17 }}>No assignments yet.</p>
        </div>
      )}
    </div>
  );
}
