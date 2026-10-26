import { SampleStatus } from "@prisma/client";
import { STATUS_LABELS, getStatusColor } from "@/lib/constants";

interface StatusBadgeProps {
  status: SampleStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const color = getStatusColor(status);
  const isSmall = size === "sm";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      background: `${color}14`,
      color,
      fontSize: isSmall ? 11 : 12,
      fontWeight: 600,
      padding: isSmall ? "2px 8px" : "3px 10px",
      borderRadius: 9999,
      letterSpacing: "-0.12px",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {STATUS_LABELS[status]}
    </span>
  );
}
