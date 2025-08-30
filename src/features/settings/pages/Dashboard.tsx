import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Download, Trash2, Moon, Sun, Monitor, Shield } from "lucide-react";
import { useFinanceStore } from "@/domains/finance/store";
/**
 * SETTINGS DASHBOARD
 * -------------------
 * Purpose: real settings (no charts). Local-first preferences for the whole app and
 *          basic Finance data controls (export/import/reset).
 *
 * Structure:
 * - Tiny local preference hook (saves to localStorage)
 * - Small presentational helpers (Section, Row, Select, Toggle)
 * - Main SettingsDashboard component
 *
 * Notes:
 * - Theme is applied by toggling `data-theme` on <html>. If you prefer class toggling, swap it out later.
 * - Export/import only touches Finance for now; add health/work/mind later using the same pattern.
 */

/* ---------------------------------- */
/* Local preference hook (localStorage)*/
/* ---------------------------------- */

function useLocalPref<T>(key: string, initial: T) {
  // Read initial value from localStorage once on mount
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  // Persist whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // noop (storage may be unavailable in private mode)
    }
  }, [key, val]);

  return [val, setVal] as const;
}

/* ---------------------------------- */
/* Small presentational building blocks */
/* ---------------------------------- */

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {desc ? <p className="mt-1 text-sm text-neutral-400">{desc}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  hint,
  control,
}: {
  label: string;
  hint?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div>
        <div className="text-sm text-neutral-200">{label}</div>
        {hint ? <div className="text-xs text-neutral-500">{hint}</div> : null}
      </div>
      <div className="sm:min-w-[260px]">{control}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
        checked
          ? "border-emerald-600/50 bg-emerald-900/20 text-emerald-200"
          : "border-neutral-700 bg-neutral-900 text-neutral-200"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-4 w-7 rounded-full transition ${
          checked ? "bg-emerald-500/70" : "bg-neutral-700"
        }`}
      />
      {label}
    </button>
  );
}

/* ---------------------------------- */
/* Main component                      */
/* ---------------------------------- */

export default function SettingsDashboard() {
  /** GLOBAL PREFS (local-only for now) */
  const [theme, setTheme] = useLocalPref<"system" | "light" | "dark">(
    "ls.pref.theme",
    "system"
  );
  const [currency, setCurrency] = useLocalPref<"GBP" | "USD" | "EUR">(
    "ls.pref.currency",
    "GBP"
  );
  const [dateFmt, setDateFmt] = useLocalPref<
    "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
  >("ls.pref.datefmt", "DD/MM/YYYY");
  const [startWeekOn, setStartWeekOn] = useLocalPref<"Mon" | "Sun">(
    "ls.pref.weekstart",
    "Mon"
  );
  const [telemetry, setTelemetry] = useLocalPref<boolean>(
    "ls.pref.telemetry",
    false
  );

  /** Apply theme by writing an attribute on <html> */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  /** FINANCE DATA CONTROLS (export/import/reset) */
  const { accounts, categories, transactions, snapshots } = useFinanceStore();
  const financeState = { accounts, categories, transactions, snapshots };

  const fileRef = useRef<HTMLInputElement>(null);

  /** Export current Finance state as a JSON file */
  const exportJson = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      currencyPref: currency,
      dateFmt,
      data: financeState,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifesculptor-finance-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /** Import a Finance backup JSON (replaces current Finance state) */
  const importJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed?.data;
      // quick shape check (MVP-level)
      if (
        !data ||
        !Array.isArray(data.accounts) ||
        !Array.isArray(data.transactions)
      ) {
        alert("Invalid file format.");
        return;
      }
      // Replace the zustand state wholesale (safe for local-only MVP)
      useFinanceStore.setState({
        accounts: data.accounts,
        categories: data.categories ?? [],
        transactions: data.transactions,
        snapshots: data.snapshots ?? [],
      });
      alert("Import complete.");
    } catch (err) {
      console.error(err);
      alert("Failed to import JSON.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /** Danger zone: wipe local Finance state */
  const resetAll = () => {
    if (
      !confirm(
        "This will permanently clear Finance data on this device. Continue?"
      )
    )
      return;
    try {
      // Remove persisted zustand key (matches your finance store `persist` name)
      localStorage.removeItem("ls-finance-v1");
    } catch {}
    // Clear in-memory state
    useFinanceStore.setState({
      accounts: [],
      categories: [],
      transactions: [],
      snapshots: [],
    });
    alert("Finance data cleared.");
  };

  // const themeIcon = useMemo(
  //   () =>
  //     theme === "dark" ? (
  //       <Moon size={14} />
  //     ) : theme === "light" ? (
  //       <Sun size={14} />
  //     ) : (
  //       <Monitor size={14} />
  //     ),
  //   [theme]
  // );

  /* ------------ RENDER ------------- */
  return (
    <div className="space-y-6">
      {/* Heading */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Tune preferences and manage your data. These settings apply locally
            to this device.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex text-xs text-neutral-500">
          <Shield size={14} />
          Private-first
        </div>
      </header>

      {/* Global preferences */}
      <Section
        title="Global preferences"
        desc="Affects how LifeSculptor looks and formats values."
      >
        <Row
          label="Theme"
          hint="Choose your appearance. System follows your OS setting."
          control={
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "system", label: "System", icon: <Monitor size={14} /> },
                { key: "light", label: "Light", icon: <Sun size={14} /> },
                { key: "dark", label: "Dark", icon: <Moon size={14} /> },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTheme(opt.key as typeof theme)}
                  className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${
                    theme === opt.key
                      ? "border-emerald-600/50 bg-emerald-900/20 text-emerald-200"
                      : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                  }`}
                  title={opt.label}
                  aria-label={`Set theme ${opt.label}`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          }
        />

        <Row
          label="Default currency"
          hint="Used for display and defaults."
          control={
            <Select
              value={currency}
              onChange={(v) => setCurrency(v as typeof currency)}
              options={[
                { value: "GBP", label: "GBP (£)" },
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
              ]}
            />
          }
        />

        <Row
          label="Date format"
          hint="How dates are shown across the app."
          control={
            <Select
              value={dateFmt}
              onChange={(v) => setDateFmt(v as typeof dateFmt)}
              options={[
                { value: "DD/MM/YYYY", label: "DD/MM/YYYY (UK)" },
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY (US)" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
              ]}
            />
          }
        />

        <Row
          label="Start week on"
          hint="For calendars and weekly charts."
          control={
            <Select
              value={startWeekOn}
              onChange={(v) => setStartWeekOn(v as typeof startWeekOn)}
              options={[
                { value: "Mon", label: "Monday" },
                { value: "Sun", label: "Sunday" },
              ]}
            />
          }
        />

        <Row
          label="Anonymous telemetry"
          hint="Help improve LifeSculptor with privacy-preserving usage metrics (disabled by default)."
          control={
            <Toggle
              checked={telemetry}
              onChange={setTelemetry}
              label={telemetry ? "Enabled" : "Disabled"}
            />
          }
        />
      </Section>

      {/* Data controls */}
      <Section
        title="Data controls"
        desc="Export, import, and manage your local Finance data."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            <Download size={14} /> Export JSON
          </button>

          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={importJson}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-neutral-200 hover:bg-neutral-800"
            />
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-red-700/60 bg-red-900/20 px-4 py-2 text-sm text-red-200 hover:bg-red-900/30"
          >
            <Trash2 size={14} /> Reset Finance data
          </button>
        </div>

        <p className="text-xs text-neutral-500">
          Tip: exporting regularly gives you a portable backup you can re-import
          later or move to another device.
        </p>
      </Section>

      {/* About */}
      <Section title="About" desc="Version, license and credits.">
        <div className="text-sm text-neutral-400">
          <div>
            LifeSculptor — local-first, privacy-first tools for personal
            mastery.
          </div>
          <div className="mt-1">Version: 0.1.0 (MVP)</div>
        </div>
      </Section>
    </div>
  );
}
