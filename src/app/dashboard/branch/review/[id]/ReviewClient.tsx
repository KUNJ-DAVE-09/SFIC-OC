"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PipelineTracker } from "@/components/PipelineTracker";
import { StatusBadge } from "@/components/StatusBadge";
import { Button, Textarea } from "@/components/FormElements";

interface ReviewPageClientProps {
  sample: {
    id: string;
    sampleCode: string;
    status: string;
    sampleOffer?: {
      offerNumber: string;
      commodityName: string;
      commodityCode: string;
      category: string;
      quantity: number;
      unit: string;
      batchNumber: string;
      supplierRemarks?: string | null;
      supplier: { companyName: string; address: string; gstin?: string | null; contactPerson: string };
    } | null;
    workflowActions: Array<{
      toStatus: string;
      createdAt: string;
      actor: { name: string; role: string };
      remarks?: string | null;
    }>;
  };
}

export function ReviewPageClient({ sample }: ReviewPageClientProps) {
  const router = useRouter();
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function doAction(action: "BRANCH_APPROVE" | "REJECT") {
    setLoading(action === "BRANCH_APPROVE" ? "approve" : "reject");
    const res = await fetch(`/api/samples/${sample.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, remarks }),
    });
    setLoading(null);
    if (res.ok) router.push("/dashboard/branch");
  }

  const offer = sample.sampleOffer;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: "#7a7a7a" }}>Branch Review</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
          <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.374px", margin: 0 }}>
            {sample.sampleCode}
          </h1>
          <StatusBadge status={sample.status as never} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Offer Details */}
          {offer && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", marginBottom: 16 }}>Sample Offer Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  ["Offer Number", offer.offerNumber],
                  ["Commodity", offer.commodityName],
                  ["Code", offer.commodityCode],
                  ["Category", offer.category],
                  ["Quantity", `${offer.quantity} ${offer.unit}`],
                  ["Batch No.", offer.batchNumber],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: "#7a7a7a", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
              {offer.supplierRemarks && (
                <div style={{ marginTop: 16, padding: "12px 14px", background: "#f5f5f7", borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#7a7a7a", marginBottom: 4 }}>Supplier Remarks</div>
                  <p style={{ fontSize: 14, margin: 0 }}>{offer.supplierRemarks}</p>
                </div>
              )}
            </div>
          )}

          {/* Supplier Info */}
          {offer && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", marginBottom: 16 }}>Supplier Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  ["Company", offer.supplier.companyName],
                  ["GSTIN", offer.supplier.gstin ?? "—"],
                  ["Contact Person", offer.supplier.contactPerson],
                  ["Address", offer.supplier.address],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12, color: "#7a7a7a", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Panel */}
          {["OFFER_SUBMITTED", "BRANCH_REVIEW"].includes(sample.status) && (
            <div style={{ background: "#f5f5f7", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", marginBottom: 16 }}>Branch Decision</h3>
              <Textarea
                label="Remarks"
                placeholder="Add approval notes or rejection reason..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <Button
                  variant="danger"
                  size="sm"
                  loading={loading === "reject"}
                  onClick={() => doAction("REJECT")}
                >
                  Reject Offer
                </Button>
                <Button
                  size="sm"
                  loading={loading === "approve"}
                  onClick={() => doAction("BRANCH_APPROVE")}
                  style={{ flex: 1 }}
                >
                  Approve & Forward to FRL
                </Button>
              </div>
            </div>
          )}
        </div>

        <PipelineTracker
          status={sample.status as never}
          workflowActions={sample.workflowActions as never}
        />
      </div>
    </div>
  );
}
