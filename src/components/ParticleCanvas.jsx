import React, { useEffect, useRef, useState } from 'react';

export default function ParticleCanvas({
  particleCount,
  particleColor,
  rotationSpeed,
  interactionMode,
  interactionRadius,
  particleSize,
  interactionCoords, // { x, y } normalized from 0 to 1, or null
}) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, targetX: null, targetY: null });

  // Update canvas size on resize
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Get container width and make it responsive
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const size = Math.min(containerWidth, 1000);
      setDimensions({ width: size, height: size });
    };

    window.addEventListener('resize', handleResize);
    // Delay initial call to ensure container is fully rendered
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize/Re-initialize particles when particleCount changes
  useEffect(() => {
    const particles = [];
    const count = parseInt(particleCount, 10);
    
    // Golden ratio for uniform sphere distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = 2 * Math.PI * goldenRatio;

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere algorithm
      const t = i / count;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      const x = Math.sin(inclination) * Math.cos(azimuth);
      const y = Math.sin(inclination) * Math.sin(azimuth);
      const z = Math.cos(inclination);

      particles.push({
        // Base sphere coordinates (normalized -1 to 1)
        bx: x,
        by: y,
        bz: z,
        // Current coordinates in 3D space
        x: x * 180,
        y: y * 180,
        z: z * 180,
        // Target base coordinate (for springing back)
        tx: x * 180,
        ty: y * 180,
        tz: z * 180,
        // Current velocity
        vx: 0,
        vy: 0,
        vz: 0,
        // Random offset for organic movement
        noiseOffset: Math.random() * 100,
        // Individual particle properties
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    particlesRef.current = particles;
  }, [particleCount]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let angleX = 0.002 * rotationSpeed;
    let angleY = 0.004 * rotationSpeed;
    
    const render = () => {
      const { width, height } = dimensions;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Handle Interaction Coordinates (from webcam gesture or mouse fallback)
      let currentInteractionX = null;
      let currentInteractionY = null;

      if (interactionCoords) {
        // Coords are 0-1, map them to canvas space
        // To make hand movements natural: x is inverted or direct
        currentInteractionX = interactionCoords.x * width;
        currentInteractionY = interactionCoords.y * height;
      } else if (mouseRef.current.x !== null) {
        currentInteractionX = mouseRef.current.x;
        currentInteractionY = mouseRef.current.y;
      }

      // Smooth interaction point transition
      if (currentInteractionX !== null && currentInteractionY !== null) {
        if (mouseRef.current.targetX === null) {
          mouseRef.current.targetX = currentInteractionX;
          mouseRef.current.targetY = currentInteractionY;
        } else {
          mouseRef.current.targetX += (currentInteractionX - mouseRef.current.targetX) * 0.15;
          mouseRef.current.targetY += (currentInteractionY - mouseRef.current.targetY) * 0.15;
        }
      } else {
        mouseRef.current.targetX = null;
        mouseRef.current.targetY = null;
      }

      // Subtle base rotation accumulation
      const currentAngleX = 0.002 * rotationSpeed;
      const currentAngleY = 0.004 * rotationSpeed;
      
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);
      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);

      // We will perform rotation and force calculations
      const projectedParticles = particlesRef.current.map((p) => {
        // Rotate target shape so it spins naturally
        const targetX1 = p.tx * cosY - p.tz * sinY;
        const targetZ1 = p.tx * sinY + p.tz * cosY;
        const targetY1 = p.ty * cosX - targetZ1 * sinX;
        const targetZ2 = p.ty * sinX + targetZ1 * cosX;
        
        p.tx = targetX1;
        p.ty = targetY1;
        p.tz = targetZ2;

        // Apply automatic return-to-sphere spring force
        const springK = 0.05; // spring constant
        const damping = 0.88; // velocity friction

        const springForceX = (p.tx - p.x) * springK;
        const springForceY = (p.ty - p.y) * springK;
        const springForceZ = (p.tz - p.z) * springK;

        p.vx = (p.vx + springForceX) * damping;
        p.vy = (p.vy + springForceY) * damping;
        p.vz = (p.vz + springForceZ) * damping;

        // Apply interactive forces
        if (mouseRef.current.targetX !== null && mouseRef.current.targetY !== null) {
          // Absolute cursor coordinates relative to sphere center
          const targetRelativeX = mouseRef.current.targetX - centerX;
          const targetRelativeY = mouseRef.current.targetY - centerY;

          // Vector from particle to cursor (projected on Z=0 screen plane)
          const dx = targetRelativeX - p.x;
          const dy = targetRelativeY - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < interactionRadius && dist > 1) {
            // Strength scales down as distance increases
            const strength = (1 - dist / interactionRadius) * 4.5;
            
            if (interactionMode === 'repel') {
              p.vx -= (dx / dist) * strength;
              p.vy -= (dy / dist) * strength;
              // Push along Z as well to create spherical distortion
              p.vz -= (p.z > 0 ? 1 : -1) * strength * 0.5;
            } else if (interactionMode === 'attract') {
              p.vx += (dx / dist) * strength;
              p.vy += (dy / dist) * strength;
              p.vz += (p.z > 0 ? -1 : 1) * strength * 0.5;
            } else if (interactionMode === 'swirl') {
              // Perpendicular vector for tangential rotation
              p.vx += (-dy / dist) * strength * 1.5;
              p.vy += (dx / dist) * strength * 1.5;
            } else if (interactionMode === 'orbit') {
              // Dynamic balance of attraction and perpendicular movement
              p.vx += (dx / dist) * strength * 0.5 + (-dy / dist) * strength * 1.2;
              p.vy += (dy / dist) * strength * 0.5 + (dx / dist) * strength * 1.2;
            }
          }
        }

        // Add organic micro-vibrations
        p.pulsePhase += p.pulseSpeed;
        const vibration = Math.sin(p.pulsePhase) * 0.15;
        
        // Update positions
        p.x += p.vx + vibration;
        p.y += p.vy + vibration;
        p.z += p.vz;

        // 3D Perspective Projection
        const focalLength = 360;
        // Map depth Z to front/back scale factor
        const scale = focalLength / (focalLength + p.z);
        const projX = p.x * scale + centerX;
        const projY = p.y * scale + centerY;

        return {
          px: projX,
          py: projY,
          pz: p.z,
          scale: scale,
          original: p,
        };
      });

      // Depth sorting: Render elements from back (+Z) to front (-Z)
      // Since positive Z is further away, we sort descending by pz
      projectedParticles.sort((a, b) => b.pz - a.pz);

      // Drawing
      projectedParticles.forEach((particle) => {
        const { px, py, scale, original } = particle;
        
        // Calculate rendering dimensions
        const baseRadius = particleSize * scale;
        if (baseRadius <= 0.1) return;

        // Determine particle brightness and alpha based on depth
        // Front-facing are solid, back-facing are translucent
        const minZ = -180;
        const maxZ = 180;
        const depthPercent = (particle.pz - minZ) / (maxZ - minZ); // 0 (front) to 1 (back)
        
        const alpha = Math.max(0.12, 1 - depthPercent * 0.85);
        const brightness = Math.round(100 - depthPercent * 60);

        ctx.beginPath();
        ctx.arc(px, py, baseRadius, 0, Math.PI * 2);

        // Neon Glow effect for closer front particles
        if (depthPercent < 0.3) {
          ctx.shadowBlur = 12 * (1 - depthPercent);
          ctx.shadowColor = particleColor;
        } else {
          ctx.shadowBlur = 0;
        }

        // Dynamic color mixing with HSL
        // We parse standard colors to rich HSL gradients
        ctx.fillStyle = getDynamicColor(particleColor, alpha, brightness);
        ctx.fill();
      });

      // Draw active interactive cursor overlay (subtle neon pulse ring)
      if (mouseRef.current.targetX !== null && mouseRef.current.targetY !== null) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = particleColor;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(
          mouseRef.current.targetX,
          mouseRef.current.targetY,
          interactionRadius * 0.6,
          0,
          Math.PI * 2
        );
        ctx.stroke();

        ctx.strokeStyle = particleColor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(
          mouseRef.current.targetX,
          mouseRef.current.targetY,
          5,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, rotationSpeed, interactionMode, interactionRadius, particleSize, particleColor, interactionCoords]);

  // Handle local mouse / touch events
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Support mobile touch scaling
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientX === undefined) return;

    mouseRef.current.x = clientX - rect.left;
    mouseRef.current.y = clientY - rect.top;
  };

  const handleMouseLeave = () => {
    mouseRef.current.x = null;
    mouseRef.current.y = null;
  };

  // Helper utility to resolve dynamic alpha/brightness values
  const getDynamicColor = (colorHex, alpha, brightness) => {
    // If standard CSS hex, convert to RGB to append custom alpha
    if (colorHex.startsWith('#')) {
      const r = parseInt(colorHex.slice(1, 3), 16);
      const g = parseInt(colorHex.slice(3, 5), 16);
      const b = parseInt(colorHex.slice(5, 7), 16);

      // Lighten or darken color based on brightness param (depth representation)
      const factor = brightness / 100;
      const finalR = Math.round(r * factor);
      const finalG = Math.round(g * factor);
      const finalB = Math.round(b * factor);

      return `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;
    }
    return colorHex; // fallback
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="glass-panel relative overflow-hidden" 
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          boxShadow: `inset 0 0 40px rgba(0, 0, 0, 0.6), 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 2px ${particleColor}`,
          margin: '0 auto',
        }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseLeave}
          className="absolute inset-0 cursor-crosshair z-10"
        />
        {/* Futuristic Background Grids inside the Sphere Container */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, ${particleColor} 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>
    </div>
  );
}
