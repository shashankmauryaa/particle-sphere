import React, { useState } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import ControlPanel from './components/ControlPanel';
import GestureController from './components/GestureController';

export default function App() {
  // Configurable States
  const [particleCount, setParticleCount] = useState(1200);
  const [particleColor, setParticleColor] = useState('#00f0ff');
  const [rotationSpeed, setRotationSpeed] = useState(2);
  const [interactionMode, setInteractionMode] = useState('repel');
  const [interactionRadius, setInteractionRadius] = useState(140);
  const [particleSize, setParticleSize] = useState(2.5);

  // Gesture/Camera Interaction Coordinates
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [interactionCoords, setInteractionCoords] = useState(null);
  const [isPinching, setIsPinching] = useState(false);

  const handleCoordsUpdate = (coords) => {
    if (coords) {
      setInteractionCoords({ x: coords.x, y: coords.y });
      setIsPinching(coords.isPinching || false);
    } else {
      setInteractionCoords(null);
      setIsPinching(false);
    }
  };

  return (
    <div className="app-container">
      <main className="app-main">

        {/* Header */}
        <header className="app-header">
          <h1>Particle Sphere</h1>
          <p className="subtitle">Interactive Particle Visualization</p>
        </header>

        {/* Sphere — centered on top */}
        <div className="visualizer-section">
          <ParticleCanvas
            particleCount={particleCount}
            particleColor={particleColor}
            rotationSpeed={rotationSpeed}
            interactionMode={isPinching ? 'attract' : interactionMode}
            interactionRadius={isPinching ? interactionRadius * 1.5 : interactionRadius}
            particleSize={particleSize}
            interactionCoords={interactionCoords}
          />
        </div>

        {/* Panels side by side: Controls (left) · Gesture (right) */}
        <div className="panels-row">
          <div className="panels-row-left">
            <ControlPanel
              particleCount={particleCount}
              setParticleCount={setParticleCount}
              particleColor={particleColor}
              setParticleColor={setParticleColor}
              rotationSpeed={rotationSpeed}
              setRotationSpeed={setRotationSpeed}
              interactionMode={interactionMode}
              setInteractionMode={setInteractionMode}
              interactionRadius={interactionRadius}
              setInteractionRadius={setInteractionRadius}
              particleSize={particleSize}
              setParticleSize={setParticleSize}
            />
          </div>

          <div className="panels-row-right">
            <GestureController
              isActive={isGestureActive}
              onToggle={setIsGestureActive}
              onCoordsUpdate={handleCoordsUpdate}
              particleColor={particleColor}
            />
          </div>
        </div>

        <div className="instructions">
          <p>
            <span className="highlight">Hover</span> or <span className="highlight">drag</span> to interact
          </p>
          <p>
            Enable webcam for <span className="highlight">gesture control</span> · Pinch to attract
          </p>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 Particle Sphere</p>
      </footer>
    </div>
  );
}
