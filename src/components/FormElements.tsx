import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, children, disabled, ...props }: ButtonProps) {
  const styles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 9999,
    fontFamily: "inherit",
    fontWeight: 400,
    letterSpacing: "-0.374px",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    border: "none",
    transition: "transform 0.1s",
    opacity: disabled || loading ? 0.5 : 1,
    outline: "none",
    ...(size === "sm" && { fontSize: 14, padding: "6px 16px", letterSpacing: "-0.224px" }),
    ...(size === "md" && { fontSize: 17, padding: "11px 22px" }),
    ...(size === "lg" && { fontSize: 18, padding: "14px 28px", fontWeight: 300 }),
    ...(variant === "primary" && { background: "#0066cc", color: "#fff" }),
    ...(variant === "secondary" && { background: "transparent", color: "#0066cc", border: "1px solid #0066cc" }),
    ...(variant === "ghost" && { background: "#fafafc", color: "#333", border: "1px solid #f0f0f0", borderRadius: 11 }),
    ...(variant === "danger" && { background: "#ff3b30", color: "#fff" }),
  };

  return (
    <button
      style={styles}
      disabled={disabled || loading}
      onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      {...props}
    >
      {loading ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> : children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", color: "#1d1d1f" }}>
          {label}
        </label>
      )}
      <input
        style={{
          background: "#fff",
          border: error ? "1px solid #ff3b30" : "1px solid rgba(0,0,0,0.08)",
          borderRadius: 9999,
          padding: "12px 20px",
          fontSize: 17,
          letterSpacing: "-0.374px",
          color: "#1d1d1f",
          outline: "none",
          width: "100%",
          fontFamily: "inherit",
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: "#ff3b30", letterSpacing: "-0.12px" }}>{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, ...props }: TextareaProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", color: "#1d1d1f" }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          background: "#fff",
          border: error ? "1px solid #ff3b30" : "1px solid rgba(0,0,0,0.08)",
          borderRadius: 11,
          padding: "12px 16px",
          fontSize: 17,
          letterSpacing: "-0.374px",
          color: "#1d1d1f",
          outline: "none",
          width: "100%",
          fontFamily: "inherit",
          resize: "vertical",
          minHeight: 88,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: "#ff3b30" }}>{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, ...props }: SelectProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.224px", color: "#1d1d1f" }}>
          {label}
        </label>
      )}
      <select
        style={{
          background: "#fff",
          border: error ? "1px solid #ff3b30" : "1px solid rgba(0,0,0,0.08)",
          borderRadius: 9999,
          padding: "12px 20px",
          fontSize: 17,
          letterSpacing: "-0.374px",
          color: "#1d1d1f",
          outline: "none",
          width: "100%",
          fontFamily: "inherit",
          cursor: "pointer",
          appearance: "auto",
        }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: 12, color: "#ff3b30" }}>{error}</span>}
    </div>
  );
}
