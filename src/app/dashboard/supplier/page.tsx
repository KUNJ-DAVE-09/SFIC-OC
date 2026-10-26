export const dynamic = 'force-dynamic';
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { Plus, Package } from "lucide-react";

export default async function SupplierDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "SUPPLIER") redirect("/login");

  const supplier = await prisma.supplier.findUnique({
    where: { userId: session.user.id },
    include: {
      sampleOffers: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { sample: true },
      },
    },
  });

  if (!supplier) redirect("/login");

  const total = supplier.sampleOffers.length;
  const pending = supplier.sampleOffers.filter((o) =>
    ["OFFER_SUBMITTED", "BRANCH_REVIEW", "BRANCH_APPROVED", "FRL_ASSIGNED", "FIELD_SAMPLING", "SAMPLE_RECEIVED_FRL", "TESTING_IN_PROGRESS"].includes(o.status)
  ).length;
  const completed = supplier.sampleOffers.filter((o) => o.status === "REPORT_COMMUNICATED").length;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: "-0.224px", marginBottom: 4 }}>
          {supplier.companyName}
        </p>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", lineHeight: 1.1, color: "#1d1d1f", margin: 0 }}>
          Sample Offers
        </h1>
        <p style={{ fontSize: 24, fontWeight: 300, color: "#7a7a7a", marginTop: 8, lineHeight: 1.5 }}>
          Track your QC sample submissions end-to-end.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Offers" value={total} color="#1d1d1f" icon={<Package size={24} />} />
        <StatCard label="In Progress" value={pending} color="#0066cc" sub="Under review or testing" />
        <StatCard label="Reports Received" value={completed} color="#34c759" sub="QC complete" />
      </div>

      {/* New offer CTA */}
      <div style={{ background: "#272729", borderRadius: 18, padding: 32, marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 21, fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "0.231px" }}>
            Ready to submit a new sample?
          </h2>
          <p style={{ fontSize: 17, color: "#cccccc", marginTop: 6, fontWeight: 400 }}>
            Fill in commodity details and start the QC workflow.
          </p>
        </div>
        <Link href="/dashboard/supplier/new-offer" style={{
          background: "#0066cc",
          color: "#fff",
          borderRadius: 9999,
          padding: "11px 22px",
          fontSize: 17,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}>
          <Plus size={16} />
          New Offer
        </Link>
      </div>

      {/* Offers list */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 0" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px" }}>Your Submissions</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ background: "#f5f5f7" }}>
              {["Offer No.", "Commodity", "Category", "Quantity", "Submitted", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a7a7a" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {supplier.sampleOffers.map((o) => (
              <tr key={o.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 20px", fontSize: 12, fontFamily: "monospace", color: "#1d1d1f" }}>
                  {o.offerNumber}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 13, color: "#1d1d1f", fontWeight: 600 }}>
                  {o.commodityName}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>
                  {o.category}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 13 }}>
                  {o.quantity} {o.unit}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a7a7a" }}>
                  {new Date(o.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <StatusBadge status={o.status} size="sm" />
                </td>
                <td style={{ padding: "12px 20px" }}>
                  {o.sample && (
                    <Link href={`/dashboard/supplier/samples/${o.sample.id}`} style={{ fontSize: 13, color: "#0066cc", textDecoration: "none" }}>
                      Track →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {supplier.sampleOffers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "32px 20px", textAlign: "center", color: "#7a7a7a", fontSize: 14 }}>
                  No offers yet. Submit your first sample offer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
