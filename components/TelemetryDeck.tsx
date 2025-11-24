import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TelemetryData, ControlMode } from '../types';

interface TelemetryDeckProps {
  data: TelemetryData[];
  mode: ControlMode;
}

export const TelemetryDeck: React.FC<TelemetryDeckProps> = ({ data, mode }) => {
  const current = data[data.length - 1] || { sentiment: 50, verbosity: 0, aggression: 0, stealthIntegrity: 100 };

  const getStrokeColor = () => {
      if (mode === ControlMode.ATTACK) return "#ef4444";
      if (mode === ControlMode.STEALTH) return "#60a5fa";
      if (mode === ControlMode.PERSISTENT) return "#f59e0b";
      return "#22c55e";
  };

  return (
    <div className="h-40 bg-zinc-950 rounded-xl border border-zinc-800 p-2 grid grid-cols-4 gap-2">
      
      {/* Chart 1: Sentiment/Flow - Bigger on mobile */}
      <div className="col-span-2 bg-zinc-900/50 rounded-lg p-1 relative overflow-hidden">
        <h3 className="text-[9px] font-bold text-zinc-500 uppercase absolute top-1 left-1 z-10">Sentiment</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getStrokeColor()} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={getStrokeColor()} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="timestamp" hide />
            <YAxis hide domain={[0, 100]} />
            <Area 
                type="monotone" 
                dataKey="sentiment" 
                stroke={getStrokeColor()} 
                fillOpacity={1} 
                fill="url(#colorSentiment)" 
                isAnimationActive={false}
                strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metric 1: Stealth */}
      <div className="col-span-1 bg-zinc-900/50 rounded-lg p-1 flex flex-col items-center justify-between">
        <h3 className="text-[8px] font-bold text-zinc-500 uppercase mt-1">Stealth</h3>
        <div className="flex-1 w-full flex items-end justify-center relative pb-1">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[current]}>
                    <Bar dataKey="stealthIntegrity" radius={[2, 2, 0, 0]}>
                         <Cell fill={current.stealthIntegrity < 50 ? '#ef4444' : '#3b82f6'} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
             <div className="absolute bottom-1 font-mono text-sm font-bold text-white shadow-black drop-shadow-md">
                {current.stealthIntegrity}
            </div>
        </div>
      </div>

      {/* Metric 2: Aggression */}
      <div className="col-span-1 bg-zinc-900/50 rounded-lg p-1 flex flex-col justify-between">
        <h3 className="text-[8px] font-bold text-zinc-500 uppercase mt-1 text-center">Power</h3>
         <div className="flex-1 flex flex-col justify-end gap-[2px] px-1 pb-1">
            {Array.from({ length: 8 }).map((_, i) => (
                <div 
                    key={i} 
                    className={`h-full w-full rounded-[1px] transition-all duration-300 ${
                        (current.aggression / 12.5) > (7 - i) 
                        ? (mode === ControlMode.ATTACK ? 'bg-red-500' : 'bg-green-500') 
                        : 'bg-zinc-800'
                    }`}
                />
            ))}
        </div>
      </div>
    </div>
  );
};