import { useState, useEffect, useCallback, useRef } from 'react';
import { InterviewSocketService, WebSocketStatus, InterviewEvent } from '../services/interviewSocket';

export function useWebSocket(sessionId: string) {
  const [status, setStatus] = useState<WebSocketStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<InterviewEvent | null>(null);
  const serviceRef = useRef<InterviewSocketService | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const service = new InterviewSocketService(
      sessionId,
      (event) => setLastEvent(event),
      (newStatus) => setStatus(newStatus)
    );

    serviceRef.current = service;
    service.connect();

    return () => {
      service.disconnect();
    };
  }, [sessionId]);

  const sendAudio = useCallback((data: string) => {
    serviceRef.current?.sendAudioChunk(data);
  }, []);

  const sendVideo = useCallback((data: string) => {
    serviceRef.current?.sendVideoFrame(data);
  }, []);

  return { status, lastEvent, sendAudio, sendVideo };
}
