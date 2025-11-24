import React from 'react';
import { ControlMode, TargetPersona, TelemetryData } from '../types';
import { Power, Ghost, Crosshair, MessageSquareMore, Coffee, X, ChevronLeft } from 'lucide-react';
import { TelemetryDeck } from './TelemetryDeck';

interface ControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: ControlMode;
  setMode: (mode: ControlMode) => void;
  targetPersona: TargetPersona;
  setTargetPersona: (persona: TargetPersona) => void;
  goal: string;
  setGoal: (goal: string) => void;
  isCruising: boolean;
  toggleCruise: () => void;
  telemetry: TelemetryData[];
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isOpen,
  onClose,
  currentMode,
  setMode,
  targetPersona,
  setTargetPersona,
  goal,
  setGoal,
  isCruising,
  toggleCruise,
  telemetry
}) => {

  const modes = [
    { id: ControlMode.CRUISE, label: 'Standard', icon: Coffee, color: 'text-green-400', border: 'border-green-500/50', desc: 'Maintain conversational flow' },
    { id: ControlMode.PERSISTENT, label: 'Persistent', icon: MessageSquareMore, color: 'text-amber-400', border: 'border-amber-500/50', desc: 'Never take no for an answer' },
    { id: ControlMode.STEALTH, label: 'Stealth', icon: Ghost, color: 'text-blue-400', border: 'border-blue-500/50', desc: 'Evade detection protocols' },
    { id: ControlMode.ATTACK, label: 'Attack', icon: Crosshair, color: 'text-red-500', border: 'border-red-500/50', desc: 'Overwhelm target resources' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col animate-in slide-in-from-bottom duration-300">
      
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            COMMAND CENTER
        </h2>
        <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
            <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 pb-24">
        
        {/* Main Engagement Button */}
        <div className="p-1 rounded-2xl bg-gradient-to-b from-zinc-700 to-zinc-900">
            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-zinc-400 tracking-wider">AGENT STATUS</span>
                <span className={`text-xs font-mono px-3 py-1 rounded-full border ${isCruising ? 'bg-green-900/30 text-green-300 border-green-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                    {isCruising ? 'ONLINE' : 'OFFLINE'}
                </span>
                </div>
                <button
                onClick={toggleCruise}
                className={`
                    w-full py-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden
                    ${isCruising 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/50' 
                    : 'bg-green-600 text-black shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                    }
                `}
                >
                {isCruising && <div className="absolute inset-0 bg-red-500/10 animate-pulse-fast"></div>}
                <Power size={24} className={isCruising ? "" : "animate-pulse"} />
                <span className="relative z-10 text-lg">{isCruising ? 'EMERGENCY STOP' : 'ENGAGE AUTOPILOT'}</span>
                </button>
            </div>
        </div>

        {/* Telemetry Module */}
        <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 px-1">Live Telemetry</h3>
            <TelemetryDeck data={telemetry} mode={currentMode} />
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Protocol Selection</h3>
          <div className="grid grid-cols-1 gap-3">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border transition-all text-left relative overflow-hidden
                  ${currentMode === m.id 
                    ? `bg-zinc-900 ${m.border} ${m.color}` 
                    : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-400'
                  }
                `}
              >
                <div className={`p-3 rounded-lg bg-black/40 ${currentMode === m.id ? m.color : 'text-zinc-600'}`}>
                    <m.icon size={24} />
                </div>
                <div className="flex flex-col z-10">
                  <span className="font-bold text-base">{m.label}</span>
                  <span className="text-xs opacity-60 font-medium">{m.desc}</span>
                </div>
                {currentMode === m.id && (
                    <div className={`absolute right-0 top-0 bottom-0 w-1 ${m.color.replace('text', 'bg')}`}></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Simulation Target</h3>
                <select 
                    value={targetPersona}
                    onChange={(e) => setTargetPersona(e.target.value as TargetPersona)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-base text-zinc-300 focus:outline-none focus:border-green-500 appearance-none"
                >
                    <option value={TargetPersona.BORING_FRIEND}>Boring Friend</option>
                    <option value={TargetPersona.GLACIAL_SUPPORT}>Glacial Support (Kevin)</option>
                    <option value={TargetPersona.HOSTILE_NEGOTIATOR}>Hostile Negotiator</option>
                    <option value={TargetPersona.EX_PARTNER}>Toxic Ex-Partner</option>
                </select>
            </div>

            <div className={`transition-all duration-300 ${currentMode === ControlMode.PERSISTENT ? 'opacity-100 max-h-48' : 'opacity-40 max-h-48 grayscale'}`}>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Mission Objective</h3>
                <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Enter specific outcome required..."
                className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-amber-500 resize-none font-mono"
                />
            </div>
        </div>

      </div>
    </div>
  );
};