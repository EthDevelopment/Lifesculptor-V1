// src/features/mind/components/lib/Tooltip.tsx
export function MindTooltip({ label, payload }: any) {
  const items = Array.isArray(payload)
    ? payload.filter((p) => p && p.value != null)
    : [];
  if (!items.length) return null;
  return (
    <div
      style={{
        background: "#0b0b0bcc",
        border: "1px solid #1f1f1f",
        borderRadius: 12,
        padding: "10px 12px",
        backdropFilter: "blur(6px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "grid", gap: 4 }}>
        {items.map((it: any, i: number) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: it.color,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 12, color: "#e5e7eb" }}>{it.name}</span>
            <span
              style={{ marginLeft: "auto", fontWeight: 600, color: "#fff" }}
            >
              {typeof it.value === "number"
                ? it.value.toLocaleString()
                : it.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const axisStyle = {
  tick: { fill: "#9ca3af", fontSize: 12 },
  axisLine: false,
  tickLine: false,
} as const;

export default MindTooltip;
