export type RangeKey = "1M" | "6M" | "12M" | "24M" | "ALL";

export default function RangeTabs({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) {
  const items: RangeKey[] = ["1M", "6M", "12M", "24M", "ALL"];
  return (
    <div className="inline-flex rounded-md border border-neutral-800 bg-neutral-950/70 p-1">
      {items.map((k) => {
        const active = value === k;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={[
              "px-2.5 py-1.5 text-xs rounded transition-colors",
              active
                ? "bg-neutral-800 text-white"
                : "text-neutral-300 hover:bg-neutral-900",
            ].join(" ")}
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}
