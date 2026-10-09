import React, { useState, useEffect, useRef } from "react";
import { MAQAM_DATASET } from "./data/maqamat";
import { MaqamScale, TuningSystem, ViolinTuningPreset } from "./types/maqam";
import { audioEngine } from "./services/audioEngine";
import { ViolinFingerboard } from "./components/ViolinFingerboard";
import { MaqamSelector } from "./components/MaqamSelector";
import { Maqam53EdoChart } from "./components/Maqam53EdoChart";
import { MaqamInfoCard } from "./components/MaqamInfoCard";
import { MainMenu } from "./components/MainMenu";
import { MaqamBuilderDrawer } from "./components/MaqamBuilderDrawer";
import {
  SettingsModal,
  loadStoredSettings,
  AppSettings,
} from "./components/SettingsModal";
import { AboutModal } from "./components/AboutModal";
import { ExitModal } from "./components/ExitModal";
import { RotateCcw, PowerOff, Sun, Moon } from "lucide-react";
import { useTheme } from "./context/ThemeContext";

export const App: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  // Load initial settings from localStorage if available
  const [appSettings, setAppSettings] = useState<AppSettings>(() =>
    loadStoredSettings(),
  );

  const initialMaqam =
    MAQAM_DATASET.find((m) => m.id === appSettings.defaultMaqamId) ||
    MAQAM_DATASET[0];
  const [currentMaqam, setCurrentMaqam] = useState<MaqamScale>(initialMaqam);
  const [tuningSystem, setTuningSystem] = useState<TuningSystem>(
    appSettings.defaultTuningSystem,
  );
  const [violinTuning, setViolinTuning] = useState<ViolinTuningPreset>(
    appSettings.defaultViolinTuning,
  );

  const [activePlayingNote, setActivePlayingNote] = useState<string | null>(
    null,
  );
  const [lastFrequency, setLastFrequency] = useState<number | null>(null);
  const [isPlayingScale, setIsPlayingScale] = useState(false);
  const [isDroneOn, setIsDroneOn] = useState(false);
  const [volume, setVolume] = useState(0.75);

  // Modals and Drawer state
  const [isMaqamBuilderOpen, setIsMaqamBuilderOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const scalePlayTimeoutRef = useRef<number[]>([]);

  // Cleanup Web Audio timers on unmount
  useEffect(() => {
    return () => {
      scalePlayTimeoutRef.current.forEach((t) => clearTimeout(t));
      audioEngine.stopDrone();
    };
  }, []);

  // Convert note string like "C4", "Ed4", "F#4", "Bb3" into exact Hz
  const getFrequencyForNoteName = (
    noteName: string,
    system: TuningSystem,
  ): number => {
    const isQuarter = noteName.includes("d");
    const cleanName = noteName.replace("d", "");
    const noteMap: Record<string, number> = {
      C: 0,
      "C#": 1,
      Db: 1,
      D: 2,
      "D#": 3,
      Eb: 3,
      E: 4,
      F: 5,
      "F#": 6,
      Gb: 6,
      G: 7,
      "G#": 8,
      Ab: 8,
      A: 9,
      "A#": 10,
      Bb: 10,
      B: 11,
    };

    const match = cleanName.match(/^([A-G][#b]?)([0-9])$/);
    if (!match) return 440;

    const basePitch = match[1];
    const oct = parseInt(match[2], 10);
    const midi = (oct + 1) * 12 + (noteMap[basePitch] || 0);
    const commaOffset = isQuarter ? -2 : 0;

    return audioEngine.calculateFrequency(
      midi,
      isQuarter ? -1 : 0,
      system,
      commaOffset,
    );
  };

  // Update drone frequency when switching Maqamat if drone is active
  useEffect(() => {
    if (isDroneOn) {
      const tonicNote = currentMaqam.scaleNotes[0];
      const tonicFreq = getFrequencyForNoteName(tonicNote, tuningSystem);
      audioEngine.updateDroneFreq(tonicFreq);
    }
  }, [currentMaqam, isDroneOn, tuningSystem]);

  // Cancel scale playback when switching Maqamat
  useEffect(() => {
    if (isPlayingScale) {
      scalePlayTimeoutRef.current.forEach((t) => clearTimeout(t));
      scalePlayTimeoutRef.current = [];
      setIsPlayingScale(false);
      setActivePlayingNote(null);
    }
  }, [currentMaqam]);

  // Handle master volume changes
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setMasterVolume(newVol);
  };

  // Trigger sound when clicking notes on the fingerboard
  const handleNoteTrigger = (noteKey: string, freq: number) => {
    setActivePlayingNote(noteKey);
    setLastFrequency(freq);
    setTimeout(() => {
      setActivePlayingNote((prev) => (prev === noteKey ? null : prev));
    }, 450);
  };

  // Audition the complete scale ascending and descending (Sayr)
  // Visually highlights each note on the ViolinFingerboard in real-time,
  // persisting for the full duration of each note's playback.
  const handlePlayScale = () => {
    // If audition is already in progress, stop it cleanly
    if (isPlayingScale) {
      scalePlayTimeoutRef.current.forEach((t) => clearTimeout(t));
      scalePlayTimeoutRef.current = [];
      setIsPlayingScale(false);
      setActivePlayingNote(null);
      return;
    }

    setIsPlayingScale(true);
    scalePlayTimeoutRef.current.forEach((t) => clearTimeout(t));
    scalePlayTimeoutRef.current = [];

    // Ascending pathway, followed by authentic descending pathway
    const notesToPlay = [
      ...currentMaqam.scaleNotes,
      ...(currentMaqam.descendingNotes
        ? currentMaqam.descendingNotes.slice(1)
        : [...currentMaqam.scaleNotes].slice(0, -1).reverse()),
    ];

    const NOTE_INTERVAL_MS = 650; // Gap between note attacks (ms)
    const NOTE_PLAY_SEC = 0.65; // Audio engine bowing duration (seconds)
    const NOTE_PERSIST_MS = 590; // Duration the note remains visibly highlighted (ms)

    notesToPlay.forEach((note, index) => {
      const startTime = index * NOTE_INTERVAL_MS;

      const noteTimer = window.setTimeout(() => {
        const freq = getFrequencyForNoteName(note, tuningSystem);
        audioEngine.playNote(freq, NOTE_PLAY_SEC);

        // Real-time visual highlight on the ViolinFingerboard
        setActivePlayingNote(note);
        setLastFrequency(freq);

        // Persist the highlight for the duration of this note's playback
        const clearTimer = window.setTimeout(() => {
          setActivePlayingNote((current) =>
            current === note ? null : current,
          );
        }, NOTE_PERSIST_MS);
        scalePlayTimeoutRef.current.push(clearTimer);

        // When the final note completes its playback, reset audition state
        if (index === notesToPlay.length - 1) {
          const finishTimer = window.setTimeout(() => {
            setIsPlayingScale(false);
            setActivePlayingNote(null);
          }, NOTE_PERSIST_MS + 50);
          scalePlayTimeoutRef.current.push(finishTimer);
        }
      }, startTime);

      scalePlayTimeoutRef.current.push(noteTimer);
    });
  };

  // Toggle continuous tonic drone pedal
  const handleToggleDrone = () => {
    const tonicNote = currentMaqam.scaleNotes[0];
    const tonicFreq = getFrequencyForNoteName(tonicNote, tuningSystem);
    const newState = audioEngine.toggleDrone(tonicFreq);
    setIsDroneOn(newState);
  };

  // Handle saving settings from SettingsModal
  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    setTuningSystem(newSettings.defaultTuningSystem);
    setViolinTuning(newSettings.defaultViolinTuning);
    if (newSettings.defaultTheme) {
      setTheme(newSettings.defaultTheme);
    }
    const targetMaqam = MAQAM_DATASET.find(
      (m) => m.id === newSettings.defaultMaqamId,
    );
    if (targetMaqam) {
      setCurrentMaqam(targetMaqam);
    }
  };

  // Handle applying a custom built Maqam from MaqamBuilderDrawer
  const handleApplyCustomMaqam = (builtScale: MaqamScale) => {
    setCurrentMaqam(builtScale);
  };

  // Handle application termination
  const handleConfirmExit = () => {
    // Cancel all running playback
    scalePlayTimeoutRef.current.forEach((t) => clearTimeout(t));
    scalePlayTimeoutRef.current = [];
    setIsPlayingScale(false);
    setActivePlayingNote(null);

    // Stop continuous drone
    audioEngine.stopDrone();
    setIsDroneOn(false);

    setIsExitOpen(false);
    setIsTerminated(true);
  };

  // Handle restarting app session after termination
  const handleRestartApp = () => {
    setIsTerminated(false);
  };

  // If application has been terminated
  if (isTerminated) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#0c0d14] border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-400 mx-auto flex items-center justify-center">
            <PowerOff className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <span>Workstation Terminated</span>
              <span className="text-sm font-serif text-amber-300 font-normal">
                تم إنهاء الجلسة
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              All microtonal sound oscillators and audition timers have been
              safely discharged. Thank you for using the Arabic Violin Maqam
              Lab.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleRestartApp}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Relaunch Workstation (إعادة التشغيل)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight
          ? "bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950"
          : "bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950"
      }`}
    >
      {/* Top Navigation Bar */}
      <header
        className={`border-b sticky top-0 z-40 px-4 sm:px-6 py-3.5 backdrop-blur-md transition-colors duration-200 ${
          isLight
            ? "border-slate-200 bg-white/90 text-slate-900 shadow-sm"
            : "border-stone-800/80 bg-stone-950/85 text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-stone-950 font-bold text-xl select-none">
              🎻
            </div>
            <div>
              <h1
                className={`text-lg font-bold tracking-tight flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}
              >
                <span>Arabic Violin Maqam Lab</span>
                <span
                  className={`text-xs font-serif font-normal ${isLight ? "text-amber-700" : "text-amber-400"}`}
                >
                  مختبر مقامات الكمان العربي
                </span>
              </h1>
              <p
                className={`text-xs ${isLight ? "text-slate-500" : "text-stone-400"}`}
              >
                Microtonal Fretless Violin &amp; Maqamat Explorer (24-EDO &amp;
                53-EDO)
              </p>
            </div>
          </div>

          {/* Volume, Status Indicators, Theme Toggle, and Main Menu */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${isLight ? "text-slate-500" : "text-stone-400"}`}
              >
                Volume
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                aria-label="Master Volume"
                className="w-18 sm:w-24 accent-amber-500 cursor-pointer"
              />
            </div>

            {lastFrequency && (
              <div
                className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono ${
                  isLight
                    ? "bg-slate-100 border border-slate-200 text-amber-700 font-bold"
                    : "bg-stone-900 border border-stone-800 text-amber-400"
                }`}
              >
                <span className={isLight ? "text-slate-400" : "text-stone-500"}>
                  Freq:
                </span>
                <span className="font-bold">{lastFrequency.toFixed(1)} Hz</span>
              </div>
            )}

            {/* Quick Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs font-medium transition-all shadow-sm cursor-pointer active:scale-95 flex items-center justify-center ${
                isLight
                  ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-amber-500"
                  : "border-stone-800 bg-stone-900 text-amber-400 hover:bg-stone-850 hover:border-amber-500/50"
              }`}
              title={
                isLight
                  ? "Switch to Dark Mode (الوضع الليلي)"
                  : "Switch to Light Mode (الوضع النهاري)"
              }
              aria-label="Toggle Light/Dark Theme"
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Responsive Main Menu with Submenu Buttons */}
            <MainMenu
              onOpenMaqamBuilder={() => setIsMaqamBuilderOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenAbout={() => setIsAboutOpen(true)}
              onOpenExit={() => setIsExitOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Control Console */}
        <MaqamSelector
          currentMaqam={currentMaqam}
          onSelectMaqam={setCurrentMaqam}
          tuningSystem={tuningSystem}
          onSelectTuningSystem={setTuningSystem}
          violinTuning={violinTuning}
          onSelectViolinTuning={setViolinTuning}
          isPlayingScale={isPlayingScale}
          onPlayScale={handlePlayScale}
          isDroneOn={isDroneOn}
          onToggleDrone={handleToggleDrone}
        />

        {/* Interactive Virtual Violin Fingerboard */}
        <ViolinFingerboard
          currentMaqam={currentMaqam}
          tuningSystem={tuningSystem}
          violinTuning={violinTuning}
          activePlayingNote={activePlayingNote}
          onNoteTrigger={handleNoteTrigger}
        />

        {/* D3.js 53-EDO Microtonal Comma Interval & Tonic Relationship Chart */}
        <Maqam53EdoChart
          currentMaqam={currentMaqam}
          tuningSystem={tuningSystem}
          activePlayingNote={activePlayingNote}
          onNoteTrigger={handleNoteTrigger}
        />

        {/* Educational Reference & Jins Analysis Card */}
        <MaqamInfoCard maqam={currentMaqam} />
      </main>

      {/* Drawer: Maqam Builder */}
      <MaqamBuilderDrawer
        isOpen={isMaqamBuilderOpen}
        onClose={() => setIsMaqamBuilderOpen(false)}
        tuningSystem={tuningSystem}
        onApplyMaqam={handleApplyCustomMaqam}
      />

      {/* Modal: Application Settings */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={appSettings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Modal: About Alert Dialog */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Modal: Exit Confirmation Dialog */}
      <ExitModal
        isOpen={isExitOpen}
        onClose={() => setIsExitOpen(false)}
        onConfirmExit={handleConfirmExit}
      />

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs px-4 transition-colors ${
          isLight
            ? "border-slate-200 text-slate-500"
            : "border-stone-800/80 text-stone-500"
        }`}
      >
        <p>
          Derived from the theoretical treatises of the 1932 Cairo Congress of
          Arab Music, Offtonic Comma Theory, and MaqamWorld.
        </p>
        <p className={`mt-1 ${isLight ? "text-slate-400" : "text-stone-600"}`}>
          Features authentic 24-EDO Quarter-Tones, 53-EDO Ottoman Commas, and
          G3-D4-G4-D5 Arabic Violin scordatura.
        </p>
      </footer>
    </div>
  );
};

export default App;
