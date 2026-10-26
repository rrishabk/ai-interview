import { useState, useCallback, useRef, useEffect } from 'react';

export type MediaErrorType = 
  | 'PERMISSION_DENIED'
  | 'DEVICE_UNAVAILABLE'
  | 'DEVICE_DISCONNECTED'
  | 'UNKNOWN_ERROR';

export interface MediaError {
  type: MediaErrorType;
  message: string;
}

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [error, setError] = useState<MediaError | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.removeEventListener('ended', handleTrackEnded);
      });
      streamRef.current = null;
      setStream(null);
      setIsCameraEnabled(false);
      setIsMicrophoneEnabled(false);
    }
  }, []);

  const handleTrackEnded = useCallback(() => {
    // Fired when a device is physically disconnected
    setError({ type: 'DEVICE_DISCONNECTED', message: 'Hardware device was disconnected.' });
    stop();
  }, [stop]);

  const start = useCallback(async () => {
    stop();
    setError(null);

    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      
      streamRef.current = s;
      setStream(s);
      
      const hasVideo = s.getVideoTracks().length > 0;
      const hasAudio = s.getAudioTracks().length > 0;
      
      setIsCameraEnabled(hasVideo);
      setIsMicrophoneEnabled(hasAudio);

      s.getTracks().forEach(track => {
        track.addEventListener('ended', handleTrackEnded);
      });

    } catch (err: any) {
      console.error('MediaStream Error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError({ type: 'PERMISSION_DENIED', message: 'Camera and microphone access was denied. Please allow permissions in your browser.' });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError({ type: 'DEVICE_UNAVAILABLE', message: 'No camera or microphone found on this device.' });
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError({ type: 'DEVICE_UNAVAILABLE', message: 'Camera or microphone is already in use by another application.' });
      } else {
        setError({ type: 'UNKNOWN_ERROR', message: 'An unknown error occurred while accessing media devices.' });
      }
    }
  }, [stop, handleTrackEnded]);

  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraEnabled(videoTrack.enabled);
    }
  }, []);

  const toggleMicrophone = useCallback(() => {
    if (!streamRef.current) return;
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicrophoneEnabled(audioTrack.enabled);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    stream,
    isCameraEnabled,
    isMicrophoneEnabled,
    error,
    start,
    stop,
    toggleCamera,
    toggleMicrophone
  };
}
