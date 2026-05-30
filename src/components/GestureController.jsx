import React, { useEffect, useRef, useState } from 'react';
import { CameraOff, Loader, Hand } from 'lucide-react';

export default function GestureController({
  isActive,
  onToggle,
  onCoordsUpdate,
  particleColor,
}) {
  const [status, setStatus] = useState('idle');
  const [handDetected, setHandDetected] = useState(false);
  const [pinchDetected, setPinchDetected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const scriptLoadersRef = useRef([]);

  const loadMediaPipeScripts = () => {
    return new Promise((resolve, reject) => {
      if (window.Hands && window.Camera) {
        resolve();
        return;
      }

      const loadScript = (url) => {
        return new Promise((res, rej) => {
          const script = document.createElement('script');
          script.src = url;
          script.crossOrigin = 'anonymous';
          script.async = true;
          script.onload = res;
          script.onerror = () => rej(new Error(`Failed to load ${url}`));
          document.head.appendChild(script);
          scriptLoadersRef.current.push(script);
        });
      };

      setStatus('loading');

      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
        .then(() => loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'))
        .then(() => {
          resolve();
        })
        .catch((err) => {
          console.error(err);
          setErrorMessage('Failed to fetch tracking scripts from CDN. Check your network.');
          setStatus('error');
          reject(err);
        });
    });
  };

  const startTracking = async () => {
    try {
      await loadMediaPipeScripts();

      if (!window.Hands || !window.Camera) {
        throw new Error('MediaPipe script loading verification failed.');
      }

      setStatus('loading');

      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      hands.onResults(onHandResults);
      handsRef.current = hands;

      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && isActive) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 320,
          height: 240,
        });

        await camera.start();
        cameraRef.current = camera;
        setStatus('running');
      }
    } catch (err) {
      console.error('Camera or tracking error: ', err);
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        setStatus('permission_denied');
        setErrorMessage('Webcam access was denied. Please allow camera permissions and try again.');
      } else {
        setStatus('error');
        setErrorMessage(err.message || 'Unable to start camera gesture tracking.');
      }
      onToggle(false);
    }
  };

  const stopTracking = () => {
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {
        console.warn('Camera stop error: ', e);
      }
      cameraRef.current = null;
    }
    if (handsRef.current) {
      try {
        handsRef.current.close();
      } catch (e) {
        console.warn('Hands model close error: ', e);
      }
      handsRef.current = null;
    }
    setHandDetected(false);
    setPinchDetected(false);
    onCoordsUpdate(null);
    if (status !== 'error' && status !== 'permission_denied') {
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (isActive) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isActive]);

  useEffect(() => {
    return () => {
      scriptLoadersRef.current.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  const onHandResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandDetected(true);
      const landmarks = results.multiHandLandmarks[0];

      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];

      const mirroredX = 1 - indexTip.x;
      const indexY = indexTip.y;

      const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y, indexTip.z - thumbTip.z);
      const isPinching = pinchDist < 0.05;
      setPinchDetected(isPinching);

      onCoordsUpdate({ x: mirroredX, y: indexY, isPinching });

      ctx.fillStyle = particleColor;
      ctx.strokeStyle = '#ffffff';

      landmarks.forEach((point) => {
        const px = point.x * canvas.width;
        const py = point.y * canvas.height;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 10;
      ctx.shadowColor = particleColor;
      ctx.strokeStyle = isPinching ? '#ffffff' : particleColor;
      ctx.lineWidth = isPinching ? 3 : 2;
      ctx.beginPath();
      ctx.arc(indexTip.x * canvas.width, indexTip.y * canvas.height, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      setHandDetected(false);
      setPinchDetected(false);
      onCoordsUpdate(null);
    }
  };

  return (
    <div className="glass-panel gesture-panel">
      <div className="gesture-header">
        <div className="gesture-info">
          <div 
            className="gesture-icon"
            style={{ 
              backgroundColor: `${particleColor}12`, 
              color: particleColor,
              boxShadow: `0 0 12px ${particleColor}20`
            }}
          >
            <Hand size={16} />
          </div>
          <div>
            <h3>Gesture Control</h3>
            <p>Control with your hand</p>
          </div>
        </div>

        <button
          onClick={() => onToggle(!isActive)}
          className={`btn-3d ${isActive ? 'active' : ''}`}
          style={{
            color: isActive ? particleColor : '#aaa',
            borderColor: isActive ? `${particleColor}80` : undefined,
            boxShadow: isActive ? `0 0 14px ${particleColor}30, inset 0 2px 4px rgba(0,0,0,0.6)` : undefined,
            padding: '8px 16px',
            fontSize: '11px',
          }}
        >
          {isActive ? 'Stop Camera' : 'Enable Camera'}
        </button>
      </div>

      {isActive && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
          <div 
            className="gesture-preview"
            style={{ 
              borderColor: handDetected ? particleColor : 'rgba(255, 255, 255, 0.08)',
              boxShadow: handDetected 
                ? `0 0 20px ${particleColor}30, inset 0 1px 0 rgba(255,255,255,0.06)` 
                : 'inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <video
              ref={videoRef}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'none' }}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              width={256}
              height={192}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            {status === 'loading' && (
              <div className="loading-overlay">
                <Loader className="animate-spin" size={22} style={{ color: particleColor }} />
                <span>Loading AI engine...</span>
              </div>
            )}
          </div>

          <div className="gesture-status">
            <div className="status-item">
              <span 
                className="status-dot" 
                style={{ 
                  backgroundColor: handDetected ? '#22c55e' : '#374151',
                  boxShadow: handDetected ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none',
                  animation: handDetected ? 'pulse-slow 2s infinite' : 'none',
                }} 
              />
              <span style={{ color: handDetected ? '#4ade80' : '#4b5563' }}>
                {handDetected ? 'Hand Detected' : 'No Hand'}
              </span>
            </div>
            {handDetected && (
              <div className="status-item">
                <span 
                  className="status-dot" 
                  style={{ 
                    backgroundColor: pinchDetected ? '#22d3ee' : '#374151',
                    boxShadow: pinchDetected ? '0 0 8px rgba(34, 211, 238, 0.5)' : 'none',
                  }} 
                />
                <span style={{ color: pinchDetected ? '#22d3ee' : '#4b5563' }}>
                  {pinchDetected ? 'Pinch Active' : 'Pinch to Attract'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {!isActive && status !== 'permission_denied' && (
        <div className="gesture-idle">
          <CameraOff size={14} />
          <span>Click the button above to enable gesture control</span>
        </div>
      )}

      {status === 'permission_denied' && (
        <div className="error-box">
          <p>{errorMessage}</p>
        </div>
      )}

      {status === 'error' && status !== 'permission_denied' && (
        <div className="error-box">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
