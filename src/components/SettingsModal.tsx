import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, RotateCcw, Save, Sun, Moon } from 'lucide-react';
import { MaqamScale, TuningSystem, ViolinTuningPreset } from '../types/maqam';
import { MAQAM_DATASET, MAQAM_FAMILIES } from '../data/maqamat';
import { useTheme, AppTheme, THEME_STORAGE_KEY } from '../context/ThemeContext';

export interface AppSettings {
  defaultMaqamId: string;
  defaultTuningSystem: TuningSystem;
  defaultViolinTuning: ViolinTuningPreset;
  defaultTheme: AppTheme;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultMaqamId: 'rast',
  defaultTuningSystem: '24-EDO',
  defaultViolinTuning: 'arabic',
  defaultTheme: 'dark',
};

const SETTINGS_STORAGE_KEY = 'arabic_violin_app_settings_v1';

export const loadStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const themeRaw = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        defaultMaqamId: parsed.defaultMaqamId || DEFAULT_APP_SETTINGS.defaultMaqamId,
        defaultTuningSystem: parsed.defaultTuningSystem || DEFAULT_APP_SETTINGS.defaultTuningSystem,
        defaultViolinTuning: parsed.defaultViolinTuning || DEFAULT_APP_SETTINGS.defaultViolinTuning,
        defaultTheme: parsed.defaultTheme || themeRaw || DEFAULT_APP_SETTINGS.defaultTheme,
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_APP_SETTINGS;
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings,
}) => {
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState<AppSettings>(() => ({
    ...currentSettings,
    defaultTheme: theme,
  }));
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Re-sync the form each time the dialog opens. The *live* theme wins over the stored
  // default, so a quick header toggle is never silently reverted by pressing Save.
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...currentSettings, defaultTheme: theme });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // storage unavailable
    }
    setTheme(formData.defaultTheme);
    onSaveSettings(formData);
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_APP_SETTINGS, defaultTheme: theme });
  };

  if (!isOpen) return null;

  const labelCls = 'text-xs font-semibold uppercase tracking-wider block text-amber-400';
  const selectCls =
    'w-full bg-canvas border border-line-strong rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer';
  const hintCls = 'text-[11px] text-ink-muted';
  const themeBtn = (active: boolean) =>
    `flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
      active
        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/40'
        : 'bg-canvas border-line text-ink-muted hover:bg-raised'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim backdrop-blur-sm anim-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-line bg-panel-pop text-ink anim-pop">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-line bg-surface/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sliders className="w-5 h-5 text-on-accent" />
            </div>
            <div>
              <h2 id="settings-title" className="text-lg font-bold flex items-center gap-2 text-ink-strong">
                <span>Application Settings</span>
                <span className="text-xs font-serif font-normal text-amber-300">إعدادات التطبيق</span>
              </h2>
              <p className="text-xs text-ink-muted">Configure default options, theme, and startup preferences.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-xl text-ink-muted hover:text-ink-strong hover:bg-raised transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Theme Preference Selection */}
          <div className="space-y-1.5">
            <span className={labelCls}>Appearance Theme (المظهر)</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={formData.defaultTheme === 'dark'}
                onClick={() => setFormData((prev) => ({ ...prev, defaultTheme: 'dark' }))}
                className={themeBtn(formData.defaultTheme === 'dark')}
              >
                <Moon className="w-4 h-4 text-amber-400" />
                <span>Dark Mode (ليلي)</span>
              </button>

              <button
                type="button"
                aria-pressed={formData.defaultTheme === 'light'}
                onClick={() => setFormData((prev) => ({ ...prev, defaultTheme: 'light' }))}
                className={themeBtn(formData.defaultTheme === 'light')}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode (نهاري)</span>
              </button>
            </div>
          </div>

          {/* 1. Default Selected Maqam */}
          <div className="space-y-1.5">
            <label htmlFor="set-maqam" className={labelCls}>
              Default Startup Maqam (المقام الافتراضي)
            </label>
            <select
              id="set-maqam"
              value={formData.defaultMaqamId}
              onChange={(e) => setFormData((prev) => ({ ...prev, defaultMaqamId: e.target.value }))}
              className={selectCls}
            >
              {MAQAM_FAMILIES.map((family) => (
                <optgroup key={family} label={`Family: ${family}`}>
                  {MAQAM_DATASET.filter((m) => m.family === family).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.arabicName})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className={hintCls}>The primary maqam scale loaded when opening the application.</p>
          </div>

          {/* 2. Default Microtonal Tuning System */}
          <div className="space-y-1.5">
            <label htmlFor="set-tuning" className={labelCls}>
              Default Microtonal Tuning System (الدوزان الافتراضي)
            </label>
            <select
              id="set-tuning"
              value={formData.defaultTuningSystem}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, defaultTuningSystem: e.target.value as TuningSystem }))
              }
              className={selectCls}
            >
              <option value="24-EDO">24-EDO (Modern Quarter Tone - Cairo 1932 Congress)</option>
              <option value="53-EDO">53-EDO (Classical Ottoman-Arab Offtonic Comma System)</option>
              <option value="12-TET">12-TET (Western Equal Temperament)</option>
            </select>
            <p className={hintCls}>Defines the mathematical frequency division used for microtonal notes.</p>
          </div>

          {/* 3. Default Peg Tuning */}
          <div className="space-y-1.5">
            <label htmlFor="set-peg" className={labelCls}>
              Default Violin Peg Tuning (تسوية الكمان الافتراضية)
            </label>
            <select
              id="set-peg"
              value={formData.defaultViolinTuning}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, defaultViolinTuning: e.target.value as ViolinTuningPreset }))
              }
              className={selectCls}
            >
              <option value="arabic">Arabic Classical: G3 - D4 - G4 - D5 (تسوية الكمان العربي)</option>
              <option value="standard">Western Classical: G3 - D4 - A4 - E5 (تسوية غربية)</option>
            </select>
            <p className={hintCls}>
              Arabic tuning lowers strings I and II by one step for enhanced resonance and fifth drones.
            </p>
          </div>

          {/* Saved feedback badge */}
          {showSavedFeedback && (
            <div
              role="status"
              className="bg-emerald-500/10 border border-emerald-500/80 rounded-xl p-3 text-emerald-300 text-xs flex items-center justify-center gap-2 anim-fade"
            >
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="font-bold">Settings saved successfully to browser storage!</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-line flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-ink-muted hover:text-ink-strong transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-ink hover:bg-raised transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-on-accent shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Options</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
