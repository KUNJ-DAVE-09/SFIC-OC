"use client";
import { useEffect, useState } from "react";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { SampleStatus } from "@prisma/client";

const STATUS_COLORS: Record<string, string> = {
  OFFER_SUBMITTED: "#0066cc",
  BRANCH_REVIEW: "#5856d6",
  BRANCH_APPROVED: "#ff9500",
  FRL_ASSIGNED: "#ff9500",
  FIELD_SAMPLING: "#ff9500",
  SAMPLE_RECEIVED_FRL: "#ff3b30",
  TESTING_IN_PROGRESS: "#ff3b30",
  REPORT_GENERATED: "#34c759",
  REPORT_COMMUNICATED: "#34c759",
  REJECTED: "#8e8e93",
  DRAFT: "#8e8e93",
};

export function LivePipelineTracker() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/pipeline/stream");
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      setCounts(JSON.parse(e.data));
      setLastUpdated(new Date());
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const stages = STATUS_ORDER.filter((s) => s !== "DRAFT");

  return (
    <div style={{ background: "#272729", borderRadius: 18, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 21, fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "0.231px" }}>
            Live Pipeline
          </h2>
          <p style={{ fontSize: 12, color: "#7a7a7a", margin: "4px 0 0" }}>
            {connected ? (
              <span style={{ color: "#34c759" }}>● Live — updates every 5s</span>
            ) : (
              <span style={{ color: "#ff9500" }}>● Connecting...</span>
            )}
            {lastUpdated && (
              <span style={{ marginLeft: 12 }}>
                Last: {lastUpdated.toLocaleTimeString("en-IN")}
              </span>
            )}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 34, fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>{total}</div>
          <div style={{ fontSize: 12, color: "#7a7a7a" }}>total samples</div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ display: "flex", height: 6, borderRadius: 9999, overflow: "hidden", marginBottom: 24, gap: 1 }}>
          {stages.map((s) => {
            const count = counts[s] ?? 0;
            if (!count) return null;
            return (
              <div
                key={s}
                style={{
                  flex: count,
                  background: STATUS_COLORS[s] ?? "#555",
                  transition: "flex 0.5s ease",
                }}
                title={`${STATUS_LABELS[s as SampleStatus]}: ${count}`}
              />
            );
          })}
        </div>
      )}

      {/* Stage grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {stages.map((s) => {
          const count = counts[s] ?? 0;
          const color = STATUS_COLORS[s] ?? "#555";
          return (
            <div key={s} style={{
              background: "#3a3a3c",
              borderRadius: 11,
              padding: "12px 14px",
              borderLeft: `3px solid ${count > 0 ? color : "#555"}`,
            }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: count > 0 ? color : "#555", lineHeight: 1.1 }}>
                {count}
              </div>
              <div style={{ fontSize: 10, color: "#7a7a7a", marginTop: 4, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {STATUS_LABELS[s as SampleStatus]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
