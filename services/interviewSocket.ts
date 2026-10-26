export type WebSocketStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';
export type InterviewState = 'setup' | 'listening' | 'processing' | 'evaluating' | 'completed';

export interface InterviewEvent {
  event: 'connected' | 'question' | 'transcript_update' | 'analysis' | 'evaluation_result' | 'next_question' | 'completed' | 'error';
  payload: any;
}

export interface QuestionPayload {
  id: string;
  number: number;
  total: number;
  text: string;
  category: string;
  difficulty: string;
  type: string;
}

export interface TranscriptPayload {
  speaker: 'ai' | 'candidate';
  text: string;
  isFinal: boolean;
}

export class InterviewSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: (event: InterviewEvent) => void;
  private onStatusChange: (status: WebSocketStatus) => void;
  private reconnectAttempts = 0;
  private maxReconnects = 5;

  constructor(sessionId: string, onMessage: (event: InterviewEvent) => void, onStatusChange: (status: WebSocketStatus) => void) {
    // Determine WS protocol based on current location protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // We mock the backend URL for now since it's missing
    this.url = `${protocol}//${host}/api/interview/stream?sessionId=${sessionId}`;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
  }

  connect() {
    this.onStatusChange('connecting');
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onStatusChange('connected');
        // Simulated connection message from missing backend
        this.onMessage({ event: 'connected', payload: { status: 'ready' } });
      };

      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          this.onMessage(data as InterviewEvent);
        } catch (err) {
          console.error('Failed to parse WS message', err);
        }
      };

      this.ws.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnects) {
          this.onStatusChange('reconnecting');
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, 1000 * Math.pow(2, this.reconnectAttempts));
        } else {
          this.onStatusChange('disconnected');
        }
      };

      this.ws.onerror = () => {
        // We do not throw raw errors to the user UI, but catch them here.
        this.onStatusChange('error');
      };
    } catch (e) {
      this.onStatusChange('error');
    }
  }

  sendAudioChunk(base64Data: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event: 'audio_chunk', payload: { data: base64Data, timestamp: Date.now() } }));
    }
  }

  sendVideoFrame(base64Data: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event: 'video_frame', payload: { image: base64Data } }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onStatusChange('disconnected');
  }
}
