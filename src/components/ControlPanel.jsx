import React from 'react';
import { Activity, Palette, Eye, RotateCw, Maximize, Circle } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Cyan Spark', hex: '#00f0ff', label: 'Cyan' },
  { name: 'Cyber Magenta', hex: '#ff007f', label: 'Magenta' },
  { name: 'Cosmic Violet', hex: '#9d4edd', label: 'Violet' },
  { name: 'Acid Green', hex: '#39ff14', label: 'Green' },
  { name: 'Solar Gold', hex: '#ff6b00', label: 'Orange' },
];

const INTERACTION_MODES = [
  { value: 'repel', label: 'Repel' },
  { value: 'attract', label: 'Attract' },
  { value: 'swirl', label: 'Swirl' },
  { value: 'orbit', label: 'Orbit' },
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
    <div className="glass-panel control-panel">
      
      {/* Particle Count */}
      <div className="control-group">
        <div className="param-header">
          <label className="control-label">
            <Activity size={12} /> Particle Density
          </label>
          <span className="control-value">{particleCount}</span>
        </div>
        <div className="slider-track">
          <div 
            className="slider-fill"
            style={{
              width: `${((particleCount - 100) / (3000 - 100)) * 100}%`,
              background: particleColor,
              boxShadow: `0 0 8px ${particleColor}50`
            }}
          />
          <input
            type="range"
            min="100"
            max="3000"
            step="50"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Color */}
      <div className="control-group">
        <label className="control-label">
          <Palette size={12} /> Color
        </label>
        
        <div className="color-presets">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => setParticleColor(color.hex)}
              className={`btn-3d ${particleColor === color.hex ? 'active' : ''}`}
              style={{
                color: particleColor === color.hex ? '#fff' : '#aaa',
                boxShadow: particleColor === color.hex 
                  ? `0 0 14px ${color.hex}40, inset 0 2px 4px rgba(0,0,0,0.6)` 
                  : undefined,
                borderColor: particleColor === color.hex ? `${color.hex}80` : undefined
              }}
            >
              <span
                className="color-dot"
                style={{ backgroundColor: color.hex, boxShadow: `0 0 6px ${color.hex}` }}
              />
              {color.label}
            </button>
          ))}
        </div>

        <div className="color-input-group">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={particleColor.toUpperCase()}
              onChange={(e) => setParticleColor(e.target.value)}
              placeholder="#FFFFFF"
              className="hex-input"
            />
            <input
              type="color"
              value={particleColor}
              onChange={(e) => setParticleColor(e.target.value)}
              className="color-picker-hidden"
            />
          </div>
        </div>
      </div>

      {/* Force Mode */}
      <div className="control-group">
        <label className="control-label">
          <Eye size={12} /> Force Mode
        </label>
        <div className="mode-grid">
          {INTERACTION_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setInteractionMode(mode.value)}
              className={`btn-3d ${interactionMode === mode.value ? 'active' : ''}`}
              style={{
                borderColor: interactionMode === mode.value ? `${particleColor}80` : undefined,
                boxShadow: interactionMode === mode.value 
                  ? `0 0 14px ${particleColor}30, inset 0 2px 4px rgba(0,0,0,0.6)` 
                  : undefined,
                color: interactionMode === mode.value ? '#fff' : '#aaa',
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Physics Parameters */}
      <div className="section-divider">

        {/* Rotation Speed */}
        <div className="param-row">
          <div className="param-header">
            <span className="label"><RotateCw size={12} /> Rotation Speed</span>
            <span className="value">{rotationSpeed}x</span>
          </div>
          <div className="slider-track">
            <div 
              className="slider-fill"
              style={{
                width: `${(rotationSpeed / 8) * 100}%`,
                background: particleColor,
                boxShadow: `0 0 8px ${particleColor}50`
              }}
            />
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Interaction Radius */}
        <div className="param-row">
          <div className="param-header">
            <span className="label"><Maximize size={12} /> Interaction Radius</span>
            <span className="value">{interactionRadius}px</span>
          </div>
          <div className="slider-track">
            <div 
              className="slider-fill"
              style={{
                width: `${((interactionRadius - 40) / (300 - 40)) * 100}%`,
                background: particleColor,
                boxShadow: `0 0 8px ${particleColor}50`
              }}
            />
            <input
              type="range"
              min="40"
              max="300"
              step="10"
              value={interactionRadius}
              onChange={(e) => setInteractionRadius(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Particle Size */}
        <div className="param-row">
          <div className="param-header">
            <span className="label"><Circle size={12} /> Particle Size</span>
            <span className="value">{particleSize}px</span>
          </div>
          <div className="slider-track">
            <div 
              className="slider-fill"
              style={{
                width: `${((particleSize - 1) / (8 - 1)) * 100}%`,
                background: particleColor,
                boxShadow: `0 0 8px ${particleColor}50`
              }}
            />
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={particleSize}
              onChange={(e) => setParticleSize(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
