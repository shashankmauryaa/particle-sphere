import React from 'react';
import { Activity, Palette, Eye, RotateCw } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Cyan Spark', hex: '#00f0ff', label: 'Cyan' },
  { name: 'Cyber Magenta', hex: '#ff007f', label: 'Magenta' },
  { name: 'Cosmic Violet', hex: '#9d4edd', label: 'Violet' },
  { name: 'Acid Green', hex: '#39ff14', label: 'Green' },
  { name: 'Solar Gold', hex: '#ff6b00', label: 'Orange' },
];

const INTERACTION_MODES = [
  { value: 'repel', label: 'Repel', desc: 'Push particles away' },
  { value: 'attract', label: 'Attract', desc: 'Draw particles in' },
  { value: 'swirl', label: 'Swirl', desc: 'Spiral particles around' },
  { value: 'orbit', label: 'Orbit', desc: 'Rotate in orbits' },
];

export default function ControlPanel({
  particleCount,
  setParticleCount,
  particleColor,
  setParticleColor,
  rotationSpeed,
  setRotationSpeed,
  interactionMode,
  setInteractionMode,
  interactionRadius,
  setInteractionRadius,
  particleSize,
  setParticleSize,
}) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-6 w-full max-w-2xl">
      
      {/* Particle Count Controller */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} /> Particle Density
          </label>
          <span className="text-xs font-mono text-white bg-white/5 px-2 py-1 rounded">
            {particleCount}
          </span>
        </div>
        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
            style={{
              width: `${((particleCount - 100) / (3000 - 100)) * 100}%`,
              background: particleColor,
              boxShadow: `0 0 10px ${particleColor}60`
            }}
          />
          <input
            type="range"
            min="100"
            max="3000"
            step="50"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Color Customization */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Palette size={12} /> Color
        </label>
        
        {/* Preset selections */}
        <div className="flex flex-wrap justify-center gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => setParticleColor(color.hex)}
              className={`btn-3d px-4 py-2 text-xs font-medium flex items-center justify-center ${particleColor === color.hex ? 'active' : ''}`}
              style={{
                color: particleColor === color.hex ? '#ffffff' : '#aaaaaa',
                boxShadow: particleColor === color.hex 
                  ? `0 0 15px ${color.hex}50, inset 0 2px 4px rgba(0,0,0,0.6)` 
                  : undefined,
                borderColor: particleColor === color.hex ? color.hex : 'rgba(0,0,0,0.8)'
              }}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                style={{ backgroundColor: color.hex, boxShadow: `0 0 8px ${color.hex}` }}
              />
              {color.label}
            </button>
          ))}
        </div>

        {/* Custom hex color input */}
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={particleColor.toUpperCase()}
              onChange={(e) => setParticleColor(e.target.value)}
              placeholder="#FFFFFF"
              className="w-28 text-xs font-mono bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-center focus:outline-none focus:border-white/20 text-white"
            />
            <input
              type="color"
              value={particleColor}
              onChange={(e) => setParticleColor(e.target.value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded cursor-pointer border-0 bg-transparent opacity-0"
            />
          </div>
        </div>
      </div>

      {/* Interaction Mode Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Eye size={12} /> Force Mode
        </label>
        <div className="grid grid-cols-4 gap-3">
          {INTERACTION_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setInteractionMode(mode.value)}
              className={`btn-3d p-3 flex items-center justify-center ${interactionMode === mode.value ? 'active' : ''}`}
              style={{
                borderColor: interactionMode === mode.value ? particleColor : 'rgba(0,0,0,0.8)',
                boxShadow: interactionMode === mode.value 
                  ? `0 0 15px ${particleColor}40, inset 0 2px 4px rgba(0,0,0,0.6)` 
                  : undefined,
              }}
            >
              <span className="text-xs font-semibold text-white">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Physics Sizing Parameters */}
      <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
        {/* Speed */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-medium flex items-center gap-2">
              <RotateCw size={12} /> Rotation Speed
            </span>
            <span className="font-mono text-white">{rotationSpeed}x</span>
          </div>
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(rotationSpeed / 8) * 100}%`,
                background: particleColor,
                boxShadow: `0 0 10px ${particleColor}60`
              }}
            />
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Radius */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-medium">Interaction Radius</span>
            <span className="font-mono text-white">{interactionRadius}px</span>
          </div>
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
              style={{
                width: `${((interactionRadius - 40) / (300 - 40)) * 100}%`,
                background: particleColor,
                boxShadow: `0 0 10px ${particleColor}60`
              }}
            />
            <input
              type="range"
              min="40"
              max="300"
              step="10"
              value={interactionRadius}
              onChange={(e) => setInteractionRadius(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Size */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-medium">Particle Size</span>
            <span className="font-mono text-white">{particleSize}px</span>
          </div>
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
              style={{
                width: `${((particleSize - 1) / (8 - 1)) * 100}%`,
                background: particleColor,
                boxShadow: `0 0 10px ${particleColor}60`
              }}
            />
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={particleSize}
              onChange={(e) => setParticleSize(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
