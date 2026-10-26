"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, Textarea, Select } from "@/components/FormElements";
import { PipelineTracker } from "@/components/PipelineTracker";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Trash2 } from "lucide-react";

interface TestParam {
  param: string;
  expected: string;
  actual: string;
  unit: string;
  result: "PASS" | "FAIL" | "PENDING";
}

const DEFAULT_PARAMS: TestParam[] = [
  { param: "Moisture Content", expected: "≤ 14%", actual: "", unit: "%", result: "PENDING" },
  { param: "Foreign Matter", expected: "≤ 1%", actual: "", unit: "%", result: "PENDING" },
  { param: "Damaged Grains", expected: "≤ 3%", actual: "", unit: "%", result: "PENDING" },
  { param: "Weevilled Grains", expected: "0%", actual: "", unit: "%", result: "PENDING" },
  { param: "Admixture", expected: "≤ 2%", actual: "", unit: "%", result: "PENDING" },
];

interface LabEntryClientProps {
  sample: {
    id: string;
    sampleCode: string;
    status: string;
    sampleOffer?: { commodityName: string; category: string } | null;
    crossSample?: { commodityName: string } | null;
    labRecord?: {
      labSampleCode: string | null;
      overallResult: string;
      testParameters: unknown;
      remarks: string | null;
    } | null;
    workflowActions: Array<{ toStatus: string; createdAt: string; actor: { name: string; role: string }; remarks?: string | null }>;
  };
}

export function LabEntryClient({ sample }: LabEntryClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [labSampleCode, setLabSampleCode] = useState(sample.labRecord?.labSampleCode ?? "");
  const [remarks, setRemarks] = useState(sample.labRecord?.remarks ?? "");
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [params, setParams] = useState<TestParam[]>(
    Array.isArray(sample.labRecord?.testParameters) && (sample.labRecord.testParameters as unknown[]).length > 0
      ? sample.labRecord.testParameters as TestParam[]
      : DEFAULT_PARAMS
  );

  const overallResult: "PASS" | "FAIL" | "PENDING" = params.some((p) => p.result === "FAIL")
    ? "FAIL"
    : params.every((p) => p.result === "PASS")
    ? "PASS"
    : "PENDING";

  function updateParam(i: number, key: keyof TestParam, value: string) {
    setParams((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  }

  function addParam() {
    setParams((p) => [...p, { param: "", expected: "", actual: "", unit: "", result: "PENDING" }]);
  }

  function removeParam(i: number) {
    setParams((p) => p.filter((_, idx) => idx !== i));
  }

  async function doAction(action: string) {
    setLoading(action);
    const body: Record<string, unknown> = { action };

    if (action === "LAB_RECEIVE") {
      body.data = { labSampleCode };
    } else if (action === "SUBMIT_RESULTS") {
      body.data = {
        testParameters: params,
        overallResult,
        remarks,
        summary,
        recommendations,
        testingStartedAt: new Date().toISOString(),
      };
    } else if (action === "COMMUNICATE_REPORT") {
      body.remarks = "QC Report communicated to all parties";
    }

    await fetch(`/api/samples/${sample.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(null);
    router.push("/dashboard/lab");
  }

  const commodity = sample.sampleOffer?.commodityName ?? sample.crossSample?.commodityName;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, color: "#7a7a7a" }}>FRL Laboratory</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
          <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.374px", margin: 0 }}>{sample.sampleCode}</h1>
          <StatusBadge status={sample.status as never} />
        </div>
        <p style={{ fontSize: 17, color: "#7a7a7a", marginTop: 4 }}>{commodity}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Step 1: Receive */}
          {sample.status === "SAMPLE_RECEIVED_FRL" && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Step 1 — Confirm Lab Receipt</h3>
              <Input
                label="Lab Sample Code"
                placeholder="FRL-LAB-2026-0001"
                value={labSampleCode}
                onChange={(e) => setLabSampleCode(e.target.value)}
              />
              <Button
                style={{ marginTop: 16 }}
                onClick={() => doAction("LAB_RECEIVE")}
                loading={loading === "LAB_RECEIVE"}
              >
                Confirm Receipt & Start Testing
              </Button>
            </div>
          )}

          {/* Step 2: Enter results */}
          {["TESTING_IN_PROGRESS", "REPORT_GENERATED", "REPORT_COMMUNICATED"].includes(sample.status) && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600 }}>Test Parameters</h3>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: overallResult === "PASS" ? "#34c759" : overallResult === "FAIL" ? "#ff3b30" : "#ff9500",
                  background: overallResult === "PASS" ? "#f0fdf4" : overallResult === "FAIL" ? "#fff1f0" : "#fff7ed",
                  padding: "3px 12px",
                  borderRadius: 9999,
                }}>
                  Overall: {overallResult}
                </span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f7" }}>
                    {["Parameter", "Expected", "Actual", "Unit", "Result", ""].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a7a7a" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {params.map((p, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "6px 12px" }}>
                        <input
                          value={p.param}
                          onChange={(e) => updateParam(i, "param", e.target.value)}
                          disabled={sample.status !== "TESTING_IN_PROGRESS"}
                          style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "4px 10px", fontSize: 13, width: "100%", fontFamily: "inherit" }}
                        />
                      </td>
                      <td style={{ padding: "6px 12px" }}>
                        <input
                          value={p.expected}
                          onChange={(e) => updateParam(i, "expected", e.target.value)}
                          disabled={sample.status !== "TESTING_IN_PROGRESS"}
                          style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "4px 10px", fontSize: 13, width: 80, fontFamily: "inherit" }}
                        />
                      </td>
                      <td style={{ padding: "6px 12px" }}>
                        <input
                          value={p.actual}
                          onChange={(e) => updateParam(i, "actual", e.target.value)}
                          disabled={sample.status !== "TESTING_IN_PROGRESS"}
                          style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "4px 10px", fontSize: 13, width: 80, fontFamily: "inherit", fontWeight: 600 }}
                          placeholder="—"
                        />
                      </td>
                      <td style={{ padding: "6px 12px" }}>
                        <input
                          value={p.unit}
                          onChange={(e) => updateParam(i, "unit", e.target.value)}
                          disabled={sample.status !== "TESTING_IN_PROGRESS"}
                          style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "4px 10px", fontSize: 13, width: 60, fontFamily: "inherit" }}
                        />
                      </td>
                      <td style={{ padding: "6px 12px" }}>
                        <select
                          value={p.result}
                          onChange={(e) => updateParam(i, "result", e.target.value)}
                          disabled={sample.status !== "TESTING_IN_PROGRESS"}
                          style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: 9999,
                            padding: "4px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: p.result === "PASS" ? "#34c759" : p.result === "FAIL" ? "#ff3b30" : "#ff9500",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                        </select>
                      </td>
                      <td style={{ padding: "6px 12px" }}>
                        {sample.status === "TESTING_IN_PROGRESS" && (
                          <button onClick={() => removeParam(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ff3b30" }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {sample.status === "TESTING_IN_PROGRESS" && (
                <button
                  onClick={addParam}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#0066cc", fontSize: 13, cursor: "pointer", marginTop: 12, padding: 0 }}
                >
                  <Plus size={14} /> Add parameter
                </button>
              )}
            </div>
          )}

          {/* Report Summary */}
          {sample.status === "TESTING_IN_PROGRESS" && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>QC Report Content</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Textarea
                  label="Report Summary"
                  placeholder="Summary of test findings..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
                <Textarea
                  label="Recommendations"
                  placeholder="Storage, procurement or rejection recommendations..."
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                />
                <Textarea
                  label="Lab Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
                <Button
                  onClick={() => doAction("SUBMIT_RESULTS")}
                  loading={loading === "SUBMIT_RESULTS"}
                  disabled={overallResult === "PENDING"}
                >
                  Generate QC Report
                </Button>
              </div>
            </div>
          )}

          {/* Communicate */}
          {sample.status === "REPORT_GENERATED" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 18, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#16a34a", marginBottom: 8 }}>QC Report Ready</h3>
              <p style={{ fontSize: 14, color: "#1d1d1f", marginBottom: 16 }}>
                Report generated. Click below to communicate it to the supplier, concerned branch and QC branch.
              </p>
              <Button onClick={() => doAction("COMMUNICATE_REPORT")} loading={loading === "COMMUNICATE_REPORT"}>
                Communicate Report to All Parties
              </Button>
            </div>
          )}

          {sample.status === "REPORT_COMMUNICATED" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 11, padding: "12px 16px", fontSize: 14, color: "#16a34a" }}>
              ✓ QC Report communicated to all parties
            </div>
          )}
        </div>

        <PipelineTracker status={sample.status as never} workflowActions={sample.workflowActions as never} />
      </div>
    </div>
  );
}
