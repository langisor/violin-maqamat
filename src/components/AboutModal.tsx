import React from 'react';
import { Info, Github, ExternalLink, Check } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="about-title"
      aria-describedby="about-desc"
    >
      <div className="w-full max-w-md bg-[#0a0e18] border border-amber-900/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 bg-stone-950/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20 shrink-0">
            <Info className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <h2 id="about-title" className="text-lg font-bold text-white flex items-center gap-2">
              <span>About Arabic Violin Lab</span>
              <span className="text-xs font-serif text-amber-300 font-normal">حول التطبيق</span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Version 2.5.0
              </span>
              <span className="text-xs text-stone-400">Release Build</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed" id="about-desc">
          <p>
            The <strong className="text-amber-300 font-semibold">Virtual Arabic Violin &amp; Maqamat Learning Tool</strong> is an authentic microtonal workstation designed for violinists, ethnomusicologists, and Arabic music practitioners.
          </p>

          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-stone-200 font-semibold">
              <span className="text-amber-400">✦</span> 24-EDO Quarter-Tones &amp; 53-EDO Ottoman Commas
            </div>
            <div className="flex items-center gap-2 text-stone-200 font-semibold">
              <span className="text-cyan-400">✦</span> Authentic G3–D4–G4–D5 Arabic Peg Scordatura
            </div>
            <div className="flex items-center gap-2 text-stone-200 font-semibold">
              <span className="text-emerald-400">✦</span> Fretless Ebony Fingerboard with Sayr Real-time Tracking
            </div>
            <div className="flex items-center gap-2 text-stone-200 font-semibold">
              <span className="text-purple-400">✦</span> Cairo Congress 1932 &amp; MaqamWorld Modal Analysis
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://github.com/google-gemini/arabic-violin-maqamat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 text-stone-200 hover:text-white transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Github className="w-5 h-5 text-stone-400 group-hover:text-amber-400 transition-colors" />
                <div className="text-left">
                  <div className="text-xs font-semibold">GitHub Repository</div>
                  <div className="text-[11px] text-stone-400 font-mono">github.com/google-gemini/arabic-violin-maqamat</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-amber-400 transition-colors" />
            </a>
          </div>
        </div>

        {/* Footer with OK button */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>OK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
