import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mic, MicOff, Zap, ShieldAlert, Pause, Play, Ear, BrainCircuit, Grip, Delete, User, Download } from 'lucide-react';
import { AgentMode, CallState } from './types';
import { LiveClient } from './services/liveClient';
import { Visualizer } from './components/Visualizer';

export default function App() {
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [mode, setMode] = useState<AgentMode>(AgentMode.CASUAL);
  const [targetInput, setTargetInput] = useState('');
  const [goal, setGoal] = useState('');
  const [volumes, setVolumes] = useState({ user: 0, ai: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const liveClientRef = useRef<LiveClient | null>(null);

  // Initialize Audio Logic
  useEffect(() => {
    liveClientRef.current = new LiveClient(
      (user, ai) => setVolumes({ user, ai }), // Volume Callback
      () => setCallState(CallState.ALERT)     // Alert Callback
    );
    return () => { liveClientRef.current?.disconnectAI(); };
  }, []);

  const startCall = async () => {
    if (!targetInput.trim()) return;
    setCallState(CallState.CONNECTING);
    
    try {
        // Initialize Audio Context and Recording immediately
        await liveClientRef.current?.startAudio();
        
        setTimeout(() => {
            setCallState(CallState.ACTIVE);
        }, 1000);
    } catch (e) {
        console.error("Failed to start audio", e);
        setCallState(CallState.IDLE);
    }
  };

  const endCall = async () => {
    // Stop AI if running
    await liveClientRef.current?.disconnectAI();
    
    // Stop Audio & Recording
    const audioBlob = await liveClientRef.current?.stopAudio();
    
    // Save Recording
    if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cruise-control-${targetInput}-${new Date().toISOString()}.webm`;
        a.click();
    }

    setCallState(CallState.IDLE);
    setVolumes({ user: 0, ai: 0 });
  };

  const toggleCruiseControl = async () => {
    if (callState === CallState.ACTIVE) {
        // Engage AI
        setCallState(CallState.CONNECTING); // Brief loading
        await liveClientRef.current?.connectAI(mode, goal);
        setCallState(CallState.AI_ENGAGED);
    } else if (callState === CallState.AI_ENGAGED || callState === CallState.ALERT) {
        // Disengage AI
        await liveClientRef.current?.disconnectAI();
        setCallState(CallState.ACTIVE);
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-black text-white font-sans overflow-hidden flex flex-col relative">
      
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${callState === CallState.IDLE ? 'opacity-20' : 'opacity-5'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-black to-black"></div>
      </div>

      {/* Main UI */}
      <div className="flex-1 flex flex-col z-10 p-6 relative h-full">
        
        {/* Header / Status */}
        <div className="flex justify-between items-center mb-4 shrink-0">
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${callState === CallState.IDLE ? 'bg-zinc-700' : 'bg-green-500 animate-pulse'}`}></div>
                <span className="font-mono text-sm tracking-widest text-zinc-400">
                    {callState === CallState.IDLE ? 'SYSTEM READY' : callState === CallState.ACTIVE ? 'REC • ACTIVE' : 'REC • CRUISE ACTIVE'}
                </span>
            </div>
            <div className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800 text-xs font-mono text-zinc-500">
                v2.1 REC
            </div>
        </div>

        {/* Central Visualizer / Input Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
            {callState === CallState.IDLE ? (
                 <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                            <Grip className="text-zinc-600" size={32} />
                        </div>
                        <h2 className="text-xl font-light tracking-wide text-zinc-300">Initiate Connection</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                            <input 
                                type="text" 
                                value={targetInput}
                                onChange={(e) => setTargetInput(e.target.value)}
                                placeholder="Enter Name or Number..."
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-lg text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                            />
                        </div>
                        
                        <button
                            onClick={startCall}
                            disabled={!targetInput.trim()}
                            className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wider transition-all transform active:scale-95 ${
                                targetInput.trim() 
                                ? 'bg-green-600 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-green-500' 
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                        >
                            START CALL
                        </button>
                    </div>
                 </div>
            ) : (
                <>
                    <div className="w-full max-w-sm mb-12">
                         {/* Persona / Number display */}
                         <div className="text-center mb-8">
                            <h2 className="text-3xl font-light text-white mb-1">{targetInput}</h2>
                            <p className="text-zinc-500 font-mono flex items-center justify-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                RECORDING
                            </p>
                         </div>
                         <Visualizer 
                            userVol={volumes.user} 
                            aiVol={volumes.ai} 
                            isActive={true} 
                         />
                    </div>
                    
                    {/* Alert Overlay */}
                    {callState === CallState.ALERT && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm animate-pulse z-20 rounded-3xl">
                            <div className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-4 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                                <ShieldAlert size={32} />
                                INTERVENTION REQUIRED
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>

        {/* Controls */}
        <div className="mt-auto space-y-4 shrink-0 pb-safe">
            
            {/* Configuration Panel (Only active when call active or idle) */}
            <div className={`bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 transition-all duration-300 ${callState === CallState.AI_ENGAGED ? 'opacity-50 pointer-events-none' : 'opacity-100'} ${callState === CallState.IDLE ? 'hidden' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Directive</span>
                </div>
                
                {/* Mode Selector */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                        { id: AgentMode.CASUAL, icon: Zap, label: 'Casual' },
                        { id: AgentMode.MONITOR, icon: Ear, label: 'Monitor' },
                        { id: AgentMode.NEGOTIATE, icon: BrainCircuit, label: 'Persistent' },
                        { id: AgentMode.FILIBUSTER, icon: ShieldAlert, label: 'Attack' },
                    ].map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${mode === m.id ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800' : 'bg-zinc-900 text-zinc-600 hover:bg-zinc-800'}`}
                        >
                            <m.icon size={18} className="mb-1" />
                            <span className="text-[10px] font-bold">{m.label}</span>
                        </button>
                    ))}
                </div>

                {/* Goal Input */}
                <input 
                    type="text" 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Set immutable objective..."
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:border-cyan-500 focus:outline-none placeholder-zinc-700 font-mono"
                />
            </div>

            {/* Action Bar (Only visible when call is active) */}
            {callState !== CallState.IDLE && (
                <div className="flex items-center justify-between gap-4">
                    
                    {/* Mute (Standard) */}
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full border ${isMuted ? 'bg-zinc-100 text-black border-zinc-100' : 'bg-transparent text-white border-zinc-700'}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    {/* CRUISE CONTROL BUTTON */}
                    <button
                        onClick={toggleCruiseControl}
                        className={`flex-1 h-16 rounded-full font-bold text-lg tracking-wider flex items-center justify-center gap-3 transition-all shadow-lg ${
                            callState === CallState.AI_ENGAGED 
                            ? 'bg-zinc-800 text-red-400 border border-red-900/50 shadow-red-900/20'
                            : 'bg-cyan-600 text-white shadow-cyan-500/30 hover:bg-cyan-500'
                        }`}
                    >
                        {callState === CallState.AI_ENGAGED ? (
                            <>
                                <Pause fill="currentColor" /> DISENGAGE AI
                            </>
                        ) : (
                            <>
                                <Play fill="currentColor" /> ENGAGE CRUISE
                            </>
                        )}
                    </button>

                    {/* Call End */}
                    <button 
                        onClick={endCall}
                        className="p-4 rounded-full bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                        <Phone size={24} className="rotate-135" />
                    </button>

                </div>
            )}
        </div>

      </div>

      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] opacity-20"></div>
    </div>
  );
}