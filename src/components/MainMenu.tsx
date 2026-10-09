import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Layers, Sliders, Info, LogOut, ChevronDown } from 'lucide-react';

interface MainMenuProps {
  onOpenMaqamBuilder: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenExit: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onOpenMaqamBuilder,
  onOpenSettings,
  onOpenAbout,
  onOpenExit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Main Menu Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all shadow-md cursor-pointer active:scale-95 ${
          isOpen
            ? 'border-amber-500/80 bg-amber-950/40 text-amber-300 ring-2 ring-amber-500/30'
            : 'border-stone-800 bg-stone-900/90 text-stone-200 hover:border-amber-500/50 hover:bg-stone-800 hover:text-white'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Main Navigation Menu"
      >
        <Menu className="w-4 h-4 text-amber-400" />
        <span className="font-semibold">Menu</span>
        <span className="text-xs font-serif text-amber-300/80 hidden sm:inline">القائمة</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Submenu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-[#090d16] border border-stone-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-stone-800/80 mb-1">
            <span className="text-[11px] font-mono uppercase text-stone-400 tracking-wider font-semibold">
              Application Tools &amp; Options
            </span>
          </div>

          <div className="space-y-1">
            {/* 1. Maqam Builder */}
            <button
              type="button"
              onClick={() => handleSelectAction(onOpenMaqamBuilder)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-amber-950/40 hover:text-amber-200 border border-transparent hover:border-amber-500/30 text-stone-200 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300">
                    Maqam Builder
                  </div>
                  <div className="text-[10px] text-stone-400">Order Ajnas &amp; detect maqamat</div>
                </div>
              </div>
              <span className="text-xs font-serif text-amber-400/80 font-normal">بناء المقامات</span>
            </button>

            {/* 2. Settings */}
            <button
              type="button"
              onClick={() => handleSelectAction(onOpenSettings)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-cyan-950/40 hover:text-cyan-200 border border-transparent hover:border-cyan-500/30 text-stone-200 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-300">
                    Settings
                  </div>
                  <div className="text-[10px] text-stone-400">Default maqam, tuning &amp; pegs</div>
                </div>
              </div>
              <span className="text-xs font-serif text-cyan-400/80 font-normal">الإعدادات</span>
            </button>

            {/* 3. About */}
            <button
              type="button"
              onClick={() => handleSelectAction(onOpenAbout)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-purple-950/40 hover:text-purple-200 border border-transparent hover:border-purple-500/30 text-stone-200 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300">
                    About
                  </div>
                  <div className="text-[10px] text-stone-400">Version 2.5.0 &amp; GitHub repository</div>
                </div>
              </div>
              <span className="text-xs font-serif text-purple-400/80 font-normal">حول</span>
            </button>

            <div className="h-px bg-stone-800 my-1" />

            {/* 4. Exit */}
            <button
              type="button"
              onClick={() => handleSelectAction(onOpenExit)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-red-950/40 hover:text-red-200 border border-transparent hover:border-red-500/30 text-stone-300 hover:text-red-300 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-red-300 group-hover:text-red-200">
                    Exit
                  </div>
                  <div className="text-[10px] text-stone-400">Terminate workstation session</div>
                </div>
              </div>
              <span className="text-xs font-serif text-red-400/80 font-normal">إنهاء</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
