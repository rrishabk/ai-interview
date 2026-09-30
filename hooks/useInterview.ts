import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { InterviewState, QuestionPayload, TranscriptPayload } from '../services/interviewSocket';
import { useNavigate } from 'react-router-dom';

export function useInterview(sessionId: string) {
  const { status, lastEvent, sendAudio, sendVideo } = useWebSocket(sessionId);
  const navigate = useNavigate();

  const [interviewState, setInterviewState] = useState<InterviewState>('setup');
  const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(null);
  const [transcript, setTranscript] = useState<TranscriptPayload[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(45 * 60); // 45 minutes

  // Handle incoming WS events
  useEffect(() => {
    if (!lastEvent) return;

    switch (lastEvent.event) {
      case 'question':
      case 'next_question':
        setCurrentQuestion(lastEvent.payload);
        setInterviewState('listening');
        break;
      case 'transcript_update':
        setTranscript(prev => {
          // If it's not final, we replace the last transcript from the same speaker, else we append
          const p = lastEvent.payload;
          const newTranscript = [...prev];
          const last = newTranscript[newTranscript.length - 1];
          if (last && last.speaker === p.speaker && !last.isFinal) {
            newTranscript[newTranscript.length - 1] = p;
          } else {
            newTranscript.push(p);
          }
          return newTranscript;
        });
        break;
      case 'analysis':
        setInterviewState('processing');
        break;
      case 'evaluation_result':
        setInterviewState('evaluating');
        // Let evaluation stay on screen for a bit before next question
        break;
      case 'completed':
        setInterviewState('completed');
        navigate(`/reports/${sessionId}`);
        break;
      case 'error':
        // gracefully handle error without freezing
        console.error('Interview Error Payload:', lastEvent.payload);
        break;
    }
  }, [lastEvent, navigate, sessionId]);

  // Timer logic
  useEffect(() => {
    if (status !== 'connected' || interviewState === 'completed') return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, interviewState]);

  // Formatting time
  const formattedTime = `${String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:${String(timeRemaining % 60).padStart(2, '0')}`;

  const endInterview = () => {
    setInterviewState('completed');
    navigate(`/reports/${sessionId}`);
  };

  return {
    status,
    interviewState,
    currentQuestion,
    transcript,
    formattedTime,
    sendAudio,
    sendVideo,
    endInterview
  };
}
