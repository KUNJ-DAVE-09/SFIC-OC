import { SampleStatus } from "@prisma/client";
import { STATUS_LABELS, STATUS_ORDER, getStatusColor } from "@/lib/constants";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

interface PipelineTrackerProps {
  status: SampleStatus;
  workflowActions?: Array<{
    toStatus: SampleStatus;
    createdAt: Date | string;
    actor: { name: string; role: string };
    remarks?: string | null;
  }>;
}

export function PipelineTracker({ status, workflowActions = [] }: PipelineTrackerProps) {
  const isRejected = status === "REJECTED";
  const currentStep = STATUS_ORDER.indexOf(status);

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e0e0e0", padding: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", marginBottom: 20, color: "#1d1d1f" }}>
        Sample Pipeline
      </h3>

      {isRejected && (
        <div style={{ background: "#fff1f0", border: "1px solid #ffccc7", borderRadius: 8, padding: "8px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <XCircle size={14} color="#ff3b30" />
          <span style={{ fontSize: 13, color: "#ff3b30", fontWeight: 600 }}>Sample Rejected</span>
        </div>
      )}

      <div style={{ position: "relative" }}>
        {/* Connector line */}
        <div style={{
          position: "absolute",
          left: 10,
          top: 10,
          bottom: 10,
          width: 2,
          background: "#e0e0e0",
          zIndex: 0,
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STATUS_ORDER.map((s, i) => {
            const done = currentStep > i || (status === s && i === currentStep);
            const active = status === s;
            const color = active ? getStatusColor(s) : done ? "#34c759" : "#e0e0e0";
            const action = workflowActions.find((w) => w.toStatus === s);

            return (
              <div key={s} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 16, position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: done || active ? color : "#f5f5f7",
                  border: `2px solid ${color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {done && !active && <CheckCircle2 size={12} color="#fff" />}
                  {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                  {!done && !active && <Circle size={10} color="#ccc" />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? color : done ? "#1d1d1f" : "#7a7a7a",
                      letterSpacing: "-0.224px",
                    }}>
                      {STATUS_LABELS[s]}
                    </span>
                    {active && (
                      <span style={{
                        background: color,
                        color: "#fff",
                        fontSize: 10,
                        padding: "1px 8px",
                        borderRadius: 9999,
                        fontWeight: 600,
                        letterSpacing: 0,
                      }}>
                        Current
                      </span>
                    )}
                  </div>
                  {action && (
                    <div style={{ fontSize: 11, color: "#7a7a7a", marginTop: 2 }}>
                      {action.actor.name} · {new Date(action.createdAt).toLocaleDateString("en-IN")}
                      {action.remarks && <span> · {action.remarks}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
