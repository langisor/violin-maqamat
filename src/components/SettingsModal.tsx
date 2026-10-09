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
    defaultTheme: currentSettings.defaultTheme || theme,
  }));
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    setFormData({
      ...currentSettings,
      defaultTheme: currentSettings.defaultTheme || theme,
    });
  }, [currentSettings, theme, isOpen]);

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
    setFormData(DEFAULT_APP_SETTINGS);
  };

  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border transition-colors ${
        isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-[#0a0e18] border-stone-800 text-stone-100'
      }`}>
        {/* Modal Header */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${
          isLight ? 'border-stone-200 bg-stone-50' : 'border-stone-800 bg-stone-950/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-cyan-500/20">
              <Sliders className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>Application Settings</span>
                <span className={`text-xs font-serif font-normal ${isLight ? 'text-amber-600' : 'text-amber-300'}`}>إعدادات التطبيق</span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>Configure default options, theme, and startup preferences.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'text-stone-400 hover:text-stone-800 hover:bg-stone-200' : 'text-stone-400 hover:text-white hover:bg-stone-800/80'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Theme Preference Selection */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? 'text-cyan-700' : 'text-amber-400'}`}>
              Appearance Theme (المظهر)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, defaultTheme: 'dark' }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formData.defaultTheme === 'dark'
                    ? 'bg-stone-900 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/40'
                    : isLight
                    ? 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-900'
                }`}
              >
                <Moon className="w-4 h-4 text-amber-400" />
                <span>Dark Mode (ليلي)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, defaultTheme: 'light' }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formData.defaultTheme === 'light'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-700 shadow-md ring-1 ring-amber-500/40'
                    : isLight
                    ? 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-900'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode (نهاري)</span>
              </button>
            </div>
          </div>

          {/* 1. Default Selected Maqam */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? 'text-cyan-700' : 'text-amber-400'}`}>
              Default Startup Maqam (المقام الافتراضي)
            </label>
            <select
              value={formData.defaultMaqamId}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultMaqamId: e.target.value }))}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer border ${
                isLight ? 'bg-stone-50 border-stone-300 text-stone-900 focus:bg-white' : 'bg-stone-950 border-stone-700 text-stone-200'
              }`}
            >
              {MAQAM_FAMILIES.map(family => (
                <optgroup key={family} label={`Family: ${family}`}>
                  {MAQAM_DATASET.filter(m => m.family === family).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.arabicName})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
              The primary maqam scale loaded when opening the application.
            </p>
          </div>

          {/* 2. Default Microtonal Tuning System */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? 'text-cyan-700' : 'text-amber-400'}`}>
              Default Microtonal Tuning System (الدوزان الافتراضي)
            </label>
            <select
              value={formData.defaultTuningSystem}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultTuningSystem: e.target.value as TuningSystem }))}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer border ${
                isLight ? 'bg-stone-50 border-stone-300 text-stone-900 focus:bg-white' : 'bg-stone-950 border-stone-700 text-stone-200'
              }`}
            >
              <option value="24-EDO">24-EDO (Modern Quarter Tone - Cairo 1932 Congress)</option>
              <option value="53-EDO">53-EDO (Classical Ottoman-Arab Offtonic Comma System)</option>
              <option value="12-TET">12-TET (Western Equal Temperament)</option>
            </select>
            <p className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
              Defines the mathematical frequency division used for microtonal notes.
            </p>
          </div>

          {/* 3. Default Peg Tuning */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? 'text-cyan-700' : 'text-amber-400'}`}>
              Default Violin Peg Tuning (تسوية الكمان الافتراضية)
            </label>
            <select
              value={formData.defaultViolinTuning}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultViolinTuning: e.target.value as ViolinTuningPreset }))}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer border ${
                isLight ? 'bg-stone-50 border-stone-300 text-stone-900 focus:bg-white' : 'bg-stone-950 border-stone-700 text-stone-200'
              }`}
            >
              <option value="arabic">Arabic Classical: G3 - D4 - G4 - D5 (تسوية الكمان العربي)</option>
              <option value="standard">Western Classical: G3 - D4 - A4 - E5 (تسوية غربية)</option>
            </select>
            <p className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
              Arabic tuning lowers strings I and II by one step for enhanced resonance and fifth drones.
            </p>
          </div>

          {/* Saved feedback badge */}
          {showSavedFeedback && (
            <div className="bg-emerald-500/10 border border-emerald-500/80 rounded-xl p-3 text-emerald-600 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="font-bold">Settings saved successfully to browser storage!</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className={`pt-3 border-t flex items-center justify-between gap-3 ${isLight ? 'border-stone-200' : 'border-stone-800'}`}>
            <button
              type="button"
              onClick={handleReset}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors cursor-pointer ${
                isLight ? 'text-stone-500 hover:text-stone-900' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isLight ? 'text-stone-600 hover:bg-stone-100' : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-stone-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
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
