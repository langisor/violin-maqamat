import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, RotateCcw, Save } from 'lucide-react';
import { MaqamScale, TuningSystem, ViolinTuningPreset } from '../types/maqam';
import { MAQAM_DATASET, MAQAM_FAMILIES } from '../data/maqamat';

export interface AppSettings {
  defaultMaqamId: string;
  defaultTuningSystem: TuningSystem;
  defaultViolinTuning: ViolinTuningPreset;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultMaqamId: 'rast',
  defaultTuningSystem: '24-EDO',
  defaultViolinTuning: 'arabic',
};

const SETTINGS_STORAGE_KEY = 'arabic_violin_app_settings_v1';

export const loadStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        defaultMaqamId: parsed.defaultMaqamId || DEFAULT_APP_SETTINGS.defaultMaqamId,
        defaultTuningSystem: parsed.defaultTuningSystem || DEFAULT_APP_SETTINGS.defaultTuningSystem,
        defaultViolinTuning: parsed.defaultViolinTuning || DEFAULT_APP_SETTINGS.defaultViolinTuning,
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
  const [formData, setFormData] = useState<AppSettings>(currentSettings);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    setFormData(currentSettings);
  }, [currentSettings, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // storage unavailable
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0a0e18] border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-cyan-500/20">
              <Sliders className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Application Settings</span>
                <span className="text-xs font-serif text-amber-300 font-normal">إعدادات التطبيق</span>
              </h2>
              <p className="text-xs text-stone-400">Configure default options and startup preferences.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* 1. Default Selected Maqam */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 block">
              Default Startup Maqam (المقام الافتراضي)
            </label>
            <select
              value={formData.defaultMaqamId}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultMaqamId: e.target.value }))}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
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
            <p className="text-[11px] text-stone-400">
              The primary maqam scale loaded when opening the application.
            </p>
          </div>

          {/* 2. Default Microtonal Tuning System */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 block">
              Default Microtonal Tuning System (الدوزان الافتراضي)
            </label>
            <select
              value={formData.defaultTuningSystem}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultTuningSystem: e.target.value as TuningSystem }))}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
            >
              <option value="24-EDO">24-EDO (Modern Quarter Tone - Cairo 1932 Congress)</option>
              <option value="53-EDO">53-EDO (Classical Ottoman-Arab Offtonic Comma System)</option>
              <option value="12-TET">12-TET (Western Equal Temperament)</option>
            </select>
            <p className="text-[11px] text-stone-400">
              Defines the mathematical frequency division used for microtonal notes.
            </p>
          </div>

          {/* 3. Default Peg Tuning */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 block">
              Default Violin Peg Tuning (تسوية الكمان الافتراضية)
            </label>
            <select
              value={formData.defaultViolinTuning}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultViolinTuning: e.target.value as ViolinTuningPreset }))}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
            >
              <option value="arabic">Arabic Classical: G3 - D4 - G4 - D5 (تسوية الكمان العربي)</option>
              <option value="standard">Western Classical: G3 - D4 - A4 - E5 (تسوية غربية)</option>
            </select>
            <p className="text-[11px] text-stone-400">
              Arabic tuning lowers strings I and II by one step for enhanced resonance and fifth drones.
            </p>
          </div>

          {/* Saved feedback badge */}
          {showSavedFeedback && (
            <div className="bg-emerald-950/70 border border-emerald-500/80 rounded-xl p-3 text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Settings saved successfully to browser storage!</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-stone-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Options</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
