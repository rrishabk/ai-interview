"use client";

import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, Activity, Wifi, WifiOff } from 'lucide-react';
import { useInterview } from '../../../hooks/useInterview';
import { useMediaStream } from '../../../hooks/useMediaStream';
import styles from './InterviewRoom.module.css';

export default function InterviewRoom() {
  const params = useParams();
  const sessionId = params?.id as string;
  const { 
    status, 
    interviewState, 
    currentQuestion, 
    transcript, 
    formattedTime,
    endInterview
  } = useInterview((sessionId as string) || '');
  
  const { 
    stream, 
    isCameraEnabled, 
    isMicrophoneEnabled, 
    error: mediaError, 
    start: startMedia, 
    toggleCamera, 
    toggleMicrophone 
  } = useMediaStream();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Initialize media
  useEffect(() => {
    startMedia();
  }, [startMedia]);

  // Bind stream to video element safely
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraEnabled]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Determine status indicators
  let statusText = 'Connecting...';
  let isStatusActive = false;
  let isStatusError = false;

  if (status === 'error' || status === 'disconnected') {
    statusText = 'Connection interrupted';
    isStatusError = true;
  } else if (status === 'reconnecting') {
    statusText = 'Reconnecting...';
    isStatusError = true;
  } else if (status === 'connected') {
    isStatusActive = true;
    switch (interviewState) {
      case 'setup': statusText = 'Preparing interview...'; break;
      case 'listening': statusText = 'Listening'; break;
      case 'processing': statusText = 'Processing...'; break;
      case 'evaluating': statusText = 'Evaluating response...'; break;
      case 'completed': statusText = 'Interview concluded'; isStatusActive = false; break;
    }
  }

  // Graceful fallback if no question yet
  const questionNumberStr = currentQuestion 
    ? `Question ${String(currentQuestion.number).padStart(2, '0')} / ${String(currentQuestion.total).padStart(2, '0')}`
    : 'Initializing...';
    
  const questionText = currentQuestion 
    ? currentQuestion.text 
    : (status === 'error' ? 'Cannot reach server. Retrying...' : 'Waiting for next question...');

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.brand}>AI INTERVIEW</div>
        <div className={styles.centerMeta}>
          <span>{questionNumberStr}</span>
          <span className={styles.time}>{formattedTime}</span>
        </div>
        <button className={styles.endButton} onClick={endInterview}>
          End interview
        </button>
      </header>

      {/* Main Grid */}
      <main className={styles.main}>
        {/* Question Panel */}
        <section className={styles.questionPanel}>
          <div className={styles.statusIndicator}>
            <div className={`${styles.statusDot} ${isStatusActive ? styles.active : ''} ${isStatusError ? styles.error : ''}`} />
            <span>{statusText}</span>
          </div>
          
          <div className={styles.questionNumber}>{questionNumberStr}</div>
          <h2 className={`${styles.questionText} animate-fade-in`} key={currentQuestion?.id || 'empty'}>
            {questionText}
          </h2>
          
          {currentQuestion && (
            <div className={`${styles.questionMetadata} animate-fade-in`}>
              <span className={styles.metaBadge}>{currentQuestion.type}</span>
              <span className={styles.metaBadge}>{currentQuestion.difficulty}</span>
              <span className={styles.metaBadge}>{currentQuestion.category}</span>
            </div>
          )}
        </section>

        {/* Candidate Panel */}
        <aside className={styles.candidatePanel}>
          <div className={styles.videoWrapper}>
            {(!isCameraEnabled || mediaError) ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'var(--color-gray-900)' }}>
                {mediaError ? (
                  <div style={{ fontSize: '11px', color: '#dc2626', padding: '16px', textAlign: 'center', maxWidth: '200px', lineHeight: 1.4 }}>
                    {mediaError.message}
                  </div>
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-gray-800)', border: '1px solid var(--color-gray-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontFamily: 'var(--font-sans)', color: 'var(--color-gray-400)', fontWeight: 500 }}>
                    YOU
                  </div>
                )}
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={styles.video}
              />
            )}
            
            <div className={styles.videoOverlay}>
              <div className={styles.camMicStatus}>
                <button onClick={toggleCamera} style={{ display: 'flex' }} aria-label="Toggle Camera">
                  {isCameraEnabled ? <Video className={styles.icon} /> : <VideoOff className={styles.icon} color="#ef4444" />}
                </button>
                <button onClick={toggleMicrophone} style={{ display: 'flex' }} aria-label="Toggle Microphone">
                  {isMicrophoneEnabled ? <Mic className={styles.icon} /> : <MicOff className={styles.icon} color="#ef4444" />}
                </button>
              </div>
              <div className={styles.recIndicator}>
                <div className={styles.recDot} /> REC
              </div>
            </div>
          </div>

          <div className={styles.diagnostics}>
            <div className={styles.diagRow}>
              <span>Connection</span>
              {status === 'connected' ? <Wifi size={12} color="#16a34a" /> : <WifiOff size={12} color="#dc2626" />}
            </div>
            <div className={styles.diagRow}>
              <span>Latency</span>
              <span>{status === 'connected' ? '24ms' : '--'}</span>
            </div>
            <div className={styles.diagRow}>
              <span>Whisper ASR</span>
              <span>{interviewState === 'listening' ? 'Active' : 'Idle'}</span>
            </div>
            <div className={styles.diagRow}>
              <span>DeepFace</span>
              <span>Tracking</span>
            </div>
          </div>
        </aside>

        {/* Transcript Panel */}
        <section className={styles.transcriptPanel}>
          {transcript.length === 0 && (
             <div style={{ color: 'var(--color-gray-500)', fontSize: '13px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Activity size={14} /> Transcript will appear here
             </div>
          )}
          {transcript.map((line, i) => (
            <div key={i} className={styles.transcriptLine}>
              <span className={styles.speakerName}>{line.speaker === 'ai' ? 'Interviewer' : 'You'}</span>
              <span className={`${styles.speakerText} ${line.speaker === 'candidate' ? styles.candidate : ''} ${!line.isFinal ? styles.notFinal : ''}`}>
                {line.text}
              </span>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </section>
      </main>
    </div>
  );
}

