"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Select, Textarea } from "@/components/FormElements";

export default function CrossSamplingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    commodityName: "",
    commodityCode: "",
    category: "CGP",
    stockLotNumber: "",
    quantity: "",
    unit: "MT",
    collectionDate: new Date().toISOString().split("T")[0],
    godownLocation: "",
    remarks: "",
  });

  function update(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/samples/cross", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, quantity: parseFloat(form.quantity) }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard/qc");
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to create cross sample.");
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ background: "#272729", borderRadius: 18, padding: "48px 40px", marginBottom: 32, textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#7a7a7a", marginBottom: 8 }}>QC Branch — Godown Sampling</p>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", color: "#fff", margin: 0 }}>
          New Cross Sample
        </h1>
        <p style={{ fontSize: 17, color: "#cccccc", marginTop: 8 }}>
          Initiate a godown cross-sampling request digitally.
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input label="Commodity Name" placeholder="e.g. Lokwan Wheat" value={form.commodityName} onChange={(e) => update("commodityName", e.target.value)} required />
            <Input label="Commodity Code" placeholder="e.g. CGP-WH-003" value={form.commodityCode} onChange={(e) => update("commodityCode", e.target.value)} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Select label="Category" value={form.category} onChange={(e) => update("category", e.target.value)}
              options={[{ value: "CGP", label: "CGP" }, { value: "TOC", label: "TOC" }]} />
            <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} required min="0" step="0.01" />
            <Select label="Unit" value={form.unit} onChange={(e) => update("unit", e.target.value)}
              options={[{ value: "MT", label: "MT" }, { value: "KG", label: "KG" }, { value: "QTL", label: "QTL" }]} />
          </div>
          <Input label="Stock / Lot Number" placeholder="STOCK-AMD-2026-001" value={form.stockLotNumber} onChange={(e) => update("stockLotNumber", e.target.value)} required />
          <Input label="Godown Location" placeholder="GSCSCL Godown, Ahmedabad" value={form.godownLocation} onChange={(e) => update("godownLocation", e.target.value)} required />
          <Input label="Collection Date" type="date" value={form.collectionDate} onChange={(e) => update("collectionDate", e.target.value)} required />
          <Textarea label="Remarks" placeholder="Reason for cross-sampling, storage conditions..." value={form.remarks} onChange={(e) => update("remarks", e.target.value)} />
          {error && <div style={{ fontSize: 13, color: "#ff3b30", background: "#fff1f0", padding: "8px 12px", borderRadius: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 12 }}>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={loading} style={{ flex: 1 }}>Submit Cross Sample</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
