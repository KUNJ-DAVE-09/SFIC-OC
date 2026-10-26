"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Select, Textarea } from "@/components/FormElements";

export default function NewOfferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    commodityName: "",
    commodityCode: "",
    category: "CGP",
    quantity: "",
    unit: "MT",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    supplierRemarks: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/samples/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: parseFloat(form.quantity) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.fieldErrors ? JSON.stringify(data.error.fieldErrors) : "Submission failed.");
        return;
      }
      router.push("/dashboard/supplier");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
      {/* Header tile */}
      <div style={{ background: "#272729", borderRadius: 18, padding: "48px 40px", marginBottom: 32, textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: "-0.224px", marginBottom: 8 }}>Supplier Portal</p>
        <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.28px", color: "#fff", margin: 0 }}>
          New Sample Offer
        </h1>
        <p style={{ fontSize: 17, color: "#cccccc", marginTop: 8 }}>
          Submit commodity details to initiate the QC process.
        </p>
      </div>

      {/* Form */}
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input
              label="Commodity Name"
              placeholder="e.g. Chana Dal"
              value={form.commodityName}
              onChange={(e) => update("commodityName", e.target.value)}
              required
            />
            <Input
              label="Commodity Code"
              placeholder="e.g. CGP-CD-001"
              value={form.commodityCode}
              onChange={(e) => update("commodityCode", e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              options={[
                { value: "CGP", label: "CGP — Coarse Grain & Pulses" },
                { value: "TOC", label: "TOC — Textile & Other" },
              ]}
            />
            <Input
              label="Quantity"
              type="number"
              placeholder="50"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              required
              min="0"
              step="0.01"
            />
            <Select
              label="Unit"
              value={form.unit}
              onChange={(e) => update("unit", e.target.value)}
              options={[
                { value: "MT", label: "MT — Metric Tonnes" },
                { value: "KG", label: "KG — Kilograms" },
                { value: "QTL", label: "QTL — Quintals" },
              ]}
            />
          </div>

          <Input
            label="Batch / Lot Number"
            placeholder="e.g. BATCH-2026-04"
            value={form.batchNumber}
            onChange={(e) => update("batchNumber", e.target.value)}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input
              label="Manufacturing Date"
              type="date"
              value={form.manufacturingDate}
              onChange={(e) => update("manufacturingDate", e.target.value)}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={form.expiryDate}
              onChange={(e) => update("expiryDate", e.target.value)}
            />
          </div>

          <Textarea
            label="Remarks (optional)"
            placeholder="Any special notes about the commodity or sampling conditions..."
            value={form.supplierRemarks}
            onChange={(e) => update("supplierRemarks", e.target.value)}
          />

          {error && (
            <div style={{ fontSize: 13, color: "#ff3b30", background: "#fff1f0", padding: "10px 14px", borderRadius: 8 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} style={{ flex: 1 }}>
              Submit Sample Offer
            </Button>
          </div>
        </form>
      </div>

      {/* Process note */}
      <div style={{ background: "#f5f5f7", borderRadius: 11, padding: "16px 20px", marginTop: 16 }}>
        <p style={{ fontSize: 12, color: "#7a7a7a", margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: "#1d1d1f" }}>What happens next:</strong> Your offer will be reviewed by the CGP/TOC branch, forwarded to FRL for field sampling, laboratory testing, and finally a QC report will be generated and communicated to you.
        </p>
      </div>
    </div>
  );
}
