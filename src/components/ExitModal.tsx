import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  isOpen,
  onClose,
  onConfirmExit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exit-title"
      aria-describedby="exit-desc"
    >
      <div className="w-full max-w-md bg-[#0e0a0a] border border-red-950/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 bg-red-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 id="exit-title" className="text-lg font-bold text-white flex items-center gap-2">
                <span>Terminate Session?</span>
                <span className="text-xs font-serif text-red-300 font-normal">إنهاء الجلسة</span>
              </h2>
              <p className="text-xs text-stone-400">Exit the Arabic Violin workstation.</p>
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-3 text-sm text-stone-300" id="exit-desc">
          <p>
            Are you sure you want to terminate the application?
          </p>
          <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-xs text-red-200 space-y-1">
            <div>• All real-time synthesis &amp; drone oscillators will be safely suspended.</div>
            <div>• All active scales and audition timers will be immediately cleared.</div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmExit}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate &amp; Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
