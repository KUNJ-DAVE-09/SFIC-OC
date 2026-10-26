"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Textarea } from "@/components/FormElements";
import { PipelineTracker } from "@/components/PipelineTracker";
import { StatusBadge } from "@/components/StatusBadge";

interface FieldUpdateClientProps {
  record: {
    sampleId: string;
    submittedToLab: boolean;
    visitDate: string | null;
    plantAddress: string | null;
    sealNumber: string | null;
    sampleWeightKg: number | null;
    observations: string | null;
  };
  sample: {
    id: string;
    sampleCode: string;
    status: string;
    sampleOffer?: { commodityName: string; supplier: { companyName: string; address: string } } | null;
    crossSample?: { commodityName: string; godownLocation: string } | null;
    workflowActions: Array<{ toStatus: string; createdAt: string; actor: { name: string; role: string }; remarks?: string | null }>;
  };
}

export function FieldUpdateClient({ record, sample }: FieldUpdateClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"start" | "submit" | null>(null);
  const [form, setForm] = useState({
    plantAddress: record.plantAddress ?? sample.sampleOffer?.supplier.address ?? sample.crossSample?.godownLocation ?? "",
    sealNumber: record.sealNumber ?? "",
    sampleWeightKg: record.sampleWeightKg?.toString() ?? "",
    observations: record.observations ?? "",
  });

  function update(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function doAction(action: string) {
    const isSubmit = action === "SUBMIT_TO_LAB";
    setLoading(isSubmit ? "submit" : "start");
    await fetch(`/api/samples/${sample.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        data: {
          plantAddress: form.plantAddress,
          sealNumber: form.sealNumber,
          sampleWeightKg: parseFloat(form.sampleWeightKg),
          observations: form.observations,
        },
      }),
    });
    setLoading(null);
    router.push("/dashboard/field");
  }

  const commodity = sample.sampleOffer?.commodityName ?? sample.crossSample?.commodityName;
  const location = sample.sampleOffer?.supplier.address ?? sample.crossSample?.godownLocation;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: "#7a7a7a" }}>FRL Field Sampling</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
          <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.374px", margin: 0 }}>{sample.sampleCode}</h1>
          <StatusBadge status={sample.status as never} />
        </div>
        <p style={{ fontSize: 17, color: "#7a7a7a", marginTop: 4 }}>{commodity} · {location}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Field Sampling Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Plant / Godown Address" value={form.plantAddress} onChange={(e) => update("plantAddress", e.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Input label="Seal Number" placeholder="SEAL-FRL-0001" value={form.sealNumber} onChange={(e) => update("sealNumber", e.target.value)} />
                <Input label="Sample Weight (kg)" type="number" value={form.sampleWeightKg} onChange={(e) => update("sampleWeightKg", e.target.value)} step="0.01" />
              </div>
              <Textarea label="Observations" placeholder="Plant conditions, storage quality, sampling notes..." value={form.observations} onChange={(e) => update("observations", e.target.value)} />
            </div>
          </div>

          {!record.submittedToLab && (
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="ghost" onClick={() => doAction("FIELD_START")} loading={loading === "start"}>
                Save Progress
              </Button>
              <Button onClick={() => doAction("SUBMIT_TO_LAB")} loading={loading === "submit"} style={{ flex: 1 }}>
                Submit Sample to Lab
              </Button>
            </div>
          )}

          {record.submittedToLab && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 11, padding: "12px 16px", fontSize: 14, color: "#16a34a" }}>
              ✓ Sample submitted to FRL Lab
            </div>
          )}
        </div>

        <PipelineTracker status={sample.status as never} workflowActions={sample.workflowActions as never} />
      </div>
    </div>
  );
}
