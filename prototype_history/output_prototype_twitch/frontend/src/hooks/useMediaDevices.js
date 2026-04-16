import { useState, useRef, useCallback, useEffect } from 'react';

export function useMediaDevices() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceType, setSourceType] = useState('camera'); // 'camera' | 'screen' | 'both'
  const [devices, setDevices] = useState({ video: [], audio: [] });
  const streamRef = useRef(null);

  useEffect(() => {
    async function loadDevices() {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices({
          video: deviceList.filter((d) => d.kind === 'videoinput'),
          audio: deviceList.filter((d) => d.kind === 'audioinput'),
        });
      } catch {
        // ignore
      }
    }
    loadDevices();
  }, []);

  const startCamera = useCallback(async (videoDeviceId) => {
    setIsLoading(true);
    setError(null);
    try {
      const constraints = {
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
        audio: true,
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = s;
      setStream(s);
      setSourceType('camera');
      return s;
    } catch (err) {
      setError(`Camera access denied: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startScreen = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true,
      });
      streamRef.current = s;
      setStream(s);
      setSourceType('screen');
      return s;
    } catch (err) {
      setError(`Screen capture denied: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startBoth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [camStream, screenStream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }),
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }),
      ]);
      // Combine: screen video + camera audio
      const combined = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...camStream.getAudioTracks(),
      ]);
      // Keep references to stop later
      combined._camStream = camStream;
      combined._screenStream = screenStream;
      streamRef.current = combined;
      setStream(combined);
      setSourceType('both');
      return combined;
    } catch (err) {
      setError(`Media access denied: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      if (streamRef.current._camStream) {
        streamRef.current._camStream.getTracks().forEach((t) => t.stop());
      }
      if (streamRef.current._screenStream) {
        streamRef.current._screenStream.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  return {
    stream,
    error,
    isLoading,
    sourceType,
    devices,
    startCamera,
    startScreen,
    startBoth,
    stopStream,
  };
}