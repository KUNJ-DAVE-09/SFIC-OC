interface CardProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  className?: string;
  dark?: boolean;
  noPad?: boolean;
}

export function Card({ children, title, action, dark, noPad }: CardProps) {
  return (
    <div style={{
      background: dark ? "#272729" : "#ffffff",
      border: dark ? "none" : "1px solid #e0e0e0",
      borderRadius: 18,
      padding: noPad ? 0 : 24,
      overflow: "hidden",
    }}>
      {(title || action) && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: noPad ? 0 : 16,
          padding: noPad ? "16px 20px 0" : 0,
        }}>
          {title && (
            <h3 style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "-0.224px",
              color: dark ? "#ffffff" : "#1d1d1f",
              margin: 0,
            }}>
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, sub, color = "#0066cc", icon }: StatCardProps) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e0e0e0",
      borderRadius: 18,
      padding: 24,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "#7a7a7a", fontWeight: 400, letterSpacing: "-0.12px", marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color, lineHeight: 1.1, letterSpacing: "-0.374px" }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 12, color: "#7a7a7a", marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && <div style={{ color, opacity: 0.6 }}>{icon}</div>}
      </div>
    </div>
  );
}
