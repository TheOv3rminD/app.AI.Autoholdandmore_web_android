import React from 'react';

interface VisualizerProps {
  userVol: number; // 0-100
  aiVol: number; // 0-100
  isActive: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ userVol, aiVol, isActive }) => {
  return (
    <div className="h-48 w-full flex items-center justify-center gap-1">
      {/* Mirror effect for symmetry */}
      {[...Array(20)].map((_, i) => {
        // Determine height based on who is talking
        const userH = Math.min(100, Math.max(5, userVol * (Math.random() * 2)));
        const aiH = Math.min(100, Math.max(5, aiVol * (Math.random() * 2)));
        
        const height = isActive ? (userVol > aiVol ? userH : aiH) : 5;
        const color = userVol > aiVol ? 'bg-zinc-400' : 'bg-cyan-400';
        
        return (
          <div
            key={i}
            className={`w-2 rounded-full transition-all duration-75 ${color}`}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
};