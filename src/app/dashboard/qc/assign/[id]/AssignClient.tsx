"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, Textarea } from "@/components/FormElements";
import { StatusBadge } from "@/components/StatusBadge";
import { PipelineTracker } from "@/components/PipelineTracker";

interface AssignClientProps {
  sample: {
    id: string;
    sampleCode: string;
    status: string;
    sampleOffer?: { commodityName: string; quantity: number; unit: string; supplier: { companyName: string } } | null;
    crossSample?: { commodityName: string } | null;
    workflowActions: Array<{ toStatus: string; createdAt: string; actor: { name: string; role: string }; remarks?: string | null }>;
  };
  frlStaff: Array<{ id: string; name: string; email: string }>;
}

export function AssignClient({ sample, frlStaff }: AssignClientProps) {
  const router = useRouter();
  const [assignedToId, setAssignedToId] = useState(frlStaff[0]?.id ?? "");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/samples/${sample.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ASSIGN_FRL", remarks, data: { assignedToId } }),
    });
    setLoading(false);
    if (res.ok) router.push("/dashboard/qc");
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: "#7a7a7a" }}>QC Branch — FRL Assignment</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
          <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.374px", margin: 0 }}>{sample.sampleCode}</h1>
          <StatusBadge status={sample.status as never} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Sample info */}
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Sample Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                ["Commodity", sample.sampleOffer?.commodityName ?? sample.crossSample?.commodityName ?? "—"],
                ["Source", sample.sampleOffer?.supplier.companyName ?? "Cross Sample"],
                ["Quantity", sample.sampleOffer ? `${sample.sampleOffer.quantity} ${sample.sampleOffer.unit}` : "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 12, color: "#7a7a7a", marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assign form */}
          <form onSubmit={handleAssign} style={{ background: "#f5f5f7", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Assign FRL Field Staff</h3>
            <Select
              label="Select Field Staff"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              options={frlStaff.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))}
            />
            <Textarea
              label="Assignment Remarks"
              placeholder="Instructions for field staff..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <Button type="submit" loading={loading} style={{ alignSelf: "flex-end" }}>
              Assign & Forward
            </Button>
          </form>
        </div>

        <PipelineTracker status={sample.status as never} workflowActions={sample.workflowActions as never} />
      </div>
    </div>
  );
}
