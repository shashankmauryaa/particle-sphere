import React, { useEffect, useRef, useState } from 'react';
import { CameraOff, Sparkles, Loader, Hand } from 'lucide-react';

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
    <div className="glass-panel p-5 w-full max-w-2xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-5">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: `${particleColor}15`, 
              color: particleColor,
              boxShadow: `0 0 15px ${particleColor}30`
            }}
          >
            <Hand size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Gesture Control</h3>
            <p className="text-xs text-gray-500">Control with your hand</p>
          </div>
        </div>

        <button
          onClick={() => onToggle(!isActive)}
          className={`btn-3d px-4 py-2 text-xs font-semibold transition-all duration-300 ${isActive ? 'active' : ''}`}
          style={{
            color: isActive ? particleColor : '#ffffff',
            borderColor: isActive ? particleColor : 'rgba(0,0,0,0.8)',
            boxShadow: isActive ? `0 0 15px ${particleColor}40, inset 0 2px 4px rgba(0,0,0,0.6)` : undefined
          }}
        >
          {isActive ? 'Stop Camera' : 'Enable Camera'}
        </button>
      </div>

      {isActive && (
        <div className="relative w-full flex flex-col items-center gap-4">
          <div 
            className="relative w-64 h-48 rounded-xl overflow-hidden bg-black border"
            style={{ 
              borderColor: handDetected ? particleColor : 'rgba(255, 255, 255, 0.1)',
              boxShadow: handDetected ? `0 0 25px ${particleColor}40, inset 0 1px 0 rgba(255,255,255,0.1)` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover hidden"
              playsInline
              muted
            />

            <canvas
              ref={canvasRef}
              width={256}
              height={192}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />

            {status === 'loading' && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-4 gap-3">
                <Loader className="animate-spin" size={24} style={{ color: particleColor }} />
                <span className="text-xs font-medium text-gray-400">Loading AI engine...</span>
              </div>
            )}
          </div>

          <div className="flex gap-6 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${handDetected ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`} />
              <span className={handDetected ? 'text-green-400' : 'text-gray-600'}>
                {handDetected ? 'Hand Detected' : 'No Hand'}
              </span>
            </div>

            {handDetected && (
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${pinchDetected ? 'bg-cyan-400 animate-ping' : 'bg-gray-700'}`} />
                <span className={pinchDetected ? 'text-cyan-400' : 'text-gray-600'}>
                  {pinchDetected ? 'Pinch Active' : 'Pinch to Attract'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {!isActive && status !== 'permission_denied' && (
        <div className="text-center text-xs text-gray-600 py-3 flex items-center justify-center gap-2">
          <CameraOff size={14} />
          <span>Click the button above to enable gesture control</span>
        </div>
      )}

      {status === 'permission_denied' && (
        <div className="mt-3 w-full bg-red-950/30 border border-red-500/20 rounded-lg p-3 text-center">
          <p className="text-xs text-red-400 leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {status === 'error' && status !== 'permission_denied' && (
        <div className="mt-3 w-full bg-red-950/30 border border-red-500/20 rounded-lg p-3 text-center">
          <p className="text-xs text-red-400 leading-relaxed">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
