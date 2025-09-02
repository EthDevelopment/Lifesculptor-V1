import { useEffect, useState } from "react";

// storage keys already used elsewhere
const PRESET_KEY = "ls_focus_custom_cfg_v1";
const SETTINGS_KEY = "ls_mind_settings_v1";

type FocusPreset = {
  label: string;
  total: number;
  breakEvery: number;
  breakMinutes: number;
};

type MindSettings = {
  requireNoteOnEnd: boolean;
  autoStartNextBlock: boolean;
  bellOnPhaseChange: boolean;
  notifyOnPhaseChange: boolean;
  dailyGoalMin: number;
  defaultRange: "7" | "30" | "90" | "365" | "all";
  compactMode: boolean;
};

const defaultPreset: FocusPreset = {
  label: "",
  total: 25,
  breakEvery: 25,
  breakMinutes: 5,
};
const defaultSettings: MindSettings = {
  requireNoteOnEnd: false,
  autoStartNextBlock: false,
  bellOnPhaseChange: false,
  notifyOnPhaseChange: false,
  dailyGoalMin: 60,
  defaultRange: "30",
  compactMode: false,
};

function loadPreset(): FocusPreset {
  try {
    return {
      ...defaultPreset,
      ...(JSON.parse(localStorage.getItem(PRESET_KEY) || "null") || {}),
    };
  } catch {
    return defaultPreset;
  }
}
function savePreset(p: FocusPreset) {
  try {
    localStorage.setItem(PRESET_KEY, JSON.stringify(p));
  } catch {}
}

function loadSettings(): MindSettings {
  try {
    return {
      ...defaultSettings,
      ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null") || {}),
    };
  } catch {
    return defaultSettings;
  }
}
function saveSettings(s: MindSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {}
}

export default function MindSettingsPanel() {
  const [preset, setPreset] = useState<FocusPreset>(loadPreset());
  const [s, setS] = useState<MindSettings>(loadSettings());

  useEffect(() => {
    /* keep in sync if another tab changes */
    const on = (e: StorageEvent) => {
      if (e.key === PRESET_KEY) setPreset(loadPreset());
      if (e.key === SETTINGS_KEY) setS(loadSettings());
    };
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, Math.round(n)));

  const saveAll = () => {
    savePreset(preset);
    saveSettings(s);
  };

  const resetAll = () => {
    setPreset(defaultPreset);
    setS(defaultSettings);
    savePreset(defaultPreset);
    saveSettings(defaultSettings);
  };

  const requestNotifyPerm = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default")
      await Notification.requestPermission();
  };

  return (
    <div className="space-y-6 rounded-lg border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-300">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-neutral-200">
          Mind Settings
        </h3>
        <div className="flex gap-2">
          <button
            onClick={resetAll}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Reset
          </button>
          <button
            onClick={saveAll}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Save
          </button>
        </div>
      </div>

      {/* Focus defaults */}
      <section>
        <div className="mb-2 text-sm font-medium text-neutral-200">
          Focus defaults
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Label">
            <input
              value={preset.label}
              onChange={(e) => setPreset({ ...preset, label: e.target.value })}
              placeholder="Deep Work / Task"
              className="w-full rounded-md border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
            />
          </Field>
          <Field label="Total (min)">
            <NumberBox
              value={preset.total}
              onChange={(v) =>
                setPreset({ ...preset, total: clamp(v, 1, 600) })
              }
            />
          </Field>
          <Field label="Break every (min)">
            <NumberBox
              value={preset.breakEvery}
              onChange={(v) =>
                setPreset({ ...preset, breakEvery: clamp(v, 1, 180) })
              }
            />
          </Field>
          <Field label="Break length (min)">
            <NumberBox
              value={preset.breakMinutes}
              onChange={(v) =>
                setPreset({ ...preset, breakMinutes: clamp(v, 1, 60) })
              }
            />
          </Field>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          These become the defaults each time you open “Custom”.
        </p>
      </section>

      {/* Behavior */}
      <section>
        <div className="mb-2 text-sm font-medium text-neutral-200">
          Behavior
        </div>
        <Toggle
          label="Require note to end session"
          checked={s.requireNoteOnEnd}
          onChange={(v) => setS({ ...s, requireNoteOnEnd: v })}
        />
        <Toggle
          label="Auto-start next work block after a break"
          checked={s.autoStartNextBlock}
          onChange={(v) => setS({ ...s, autoStartNextBlock: v })}
        />
        <Toggle
          label="Play bell on phase change"
          checked={s.bellOnPhaseChange}
          onChange={(v) => setS({ ...s, bellOnPhaseChange: v })}
        />
        <Toggle
          label="Desktop notification on phase change"
          checked={s.notifyOnPhaseChange}
          onChange={async (v) => {
            setS({ ...s, notifyOnPhaseChange: v });
            if (v) await requestNotifyPerm(); // TODO: hook into FocusPanel
          }}
        />
      </section>

      {/* History & UI */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Field label="Daily focus goal (min)">
          <NumberBox
            value={s.dailyGoalMin}
            onChange={(v) => setS({ ...s, dailyGoalMin: clamp(v, 0, 1440) })}
          />
        </Field>
        <Field label="Default history range">
          <select
            value={s.defaultRange}
            onChange={(e) =>
              setS({ ...s, defaultRange: e.target.value as any })
            }
            className="w-full rounded-md border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
          >
            <option value="7">7d</option>
            <option value="30">30d</option>
            <option value="90">90d</option>
            <option value="365">1y</option>
            <option value="all">All</option>
          </select>
        </Field>
        <Field label="Compact mode">
          <Toggle
            label="Tighter spacing"
            checked={s.compactMode}
            onChange={(v) => setS({ ...s, compactMode: v })}
          />
        </Field>
      </section>

      <p className="text-xs text-neutral-500">
        Future hooks: enforce “require note” on End, auto-start behavior, play
        bell, send notifications, and seed history list with your default range.
        Each can be read from <code>ls_mind_settings_v1</code>.
      </p>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-neutral-400">{label}</span>
      {children}
    </label>
  );
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex select-none items-center justify-between gap-4 rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-emerald-600"
      />
    </label>
  );
}
function NumberBox({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={String(value)}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d]/g, "");
        onChange(raw === "" ? 0 : Number(raw));
      }}
      onBlur={(e) => {
        const raw = e.target.value.replace(/[^\d]/g, "");
        onChange(raw === "" ? 0 : Number(raw));
      }}
      className="w-full rounded-md border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-500"
    />
  );
}
