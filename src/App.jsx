import React, { useState } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import ControlPanel from './components/ControlPanel';
import GestureController from './components/GestureController';
import { HelpCircle, Activity, Wand2 } from 'lucide-react';

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
    <div className="flex flex-col min-h-screen">
      {/* Main App Layout - Center Aligned */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative w-full max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-8 z-10 w-full">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-3">
            Particle Sphere
          </h1>
          <p className="text-sm md:text-base text-gray-400 tracking-widest uppercase">
            Interactive Particle Visualization
          </p>
        </header>

        {/* Main Visualizer Container */}
        <div className="w-full mb-8 z-10 flex items-center justify-center">
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

        {/* Controls Container - Centered */}
        <div className="w-full flex flex-col items-center gap-6 z-10">
          
          {/* Settings Config Panel */}
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

          {/* Gesture webcam tracker controller */}
          <GestureController
            isActive={isGestureActive}
            onToggle={setIsGestureActive}
            onCoordsUpdate={handleCoordsUpdate}
            particleColor={particleColor}
          />

          {/* Instructions */}
          <div className="text-center text-gray-500 text-sm max-w-md">
            <p className="mb-2">
              <span className="text-white font-medium">Hover</span> or <span className="text-white font-medium">drag</span> to interact
            </p>
            <p>
              Enable webcam for <span className="text-white font-medium">gesture control</span> • Pinch to attract
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t border-white/5">
        <p className="text-xs text-gray-600">© 2026 Particle Sphere</p>
      </footer>
    </div>
  );
}
