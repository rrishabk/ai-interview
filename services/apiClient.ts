export interface ResumeUploadResponse {
  success: boolean;
  resumeId: string;
  filename?: string;
  status?: string;
  error?: string;
}

export interface InterviewStartRequest {
  resumeId: string;
  role: string;
  company: string;
  type: string;
  difficulty: string;
}

export interface InterviewStartResponse {
  success: boolean;
  message: string;
  sessionId: string;
  data?: {
    sessionId: string;
    resumeId: string;
    role: string;
    company: string;
    type: string;
    difficulty: string;
  };
}

export interface TranscriptionResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface ReportResponse {
  sessionId: string;
  role: string;
  company: string;
  date: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  breakdown: {
    label: string;
    score: number;
  }[];
  scoreProgression: {
    date: string;
    score: number;
  }[];
  questions: {
    id: string;
    number: number;
    category: string;
    questionText: string;
    candidateAnswer?: string;
    score: number;
    evaluation?: string;
    feedback?: string;
    speechAnalysis?: string;
    emotionAnalysis?: string;
    communicationSignals?: string;
  }[];
}

export interface HistoryRecord {
  id: string;
  date: string;
  company: string;
  role: string;
  type: string;
  score: number | null;
  duration: string;
  status: string;
}

export class ApiClient {

  private baseUrl = "http://127.0.0.1:8000";

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {

    const response = await fetch(
      `${this.baseUrl}${endpoint}`,
      {
        ...options,
        headers: {
          ...(options?.body instanceof FormData
            ? {}
            : {
                "Content-Type": "application/json"
              }),
          ...options?.headers
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }


  async uploadResume(
    file: File
  ): Promise<ResumeUploadResponse> {

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    return this.fetch<ResumeUploadResponse>(
      "/resume/upload",
      {
        method: "POST",
        body: formData
      }
    );
  }


  async startInterview(
    data: InterviewStartRequest
  ): Promise<InterviewStartResponse> {

    return this.fetch<InterviewStartResponse>(
      "/interview/start",
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    );
  }


  async transcribeAudio(
    audioBlob: Blob
  ): Promise<TranscriptionResponse> {

    const formData = new FormData();

    formData.append(
      "audio",
      audioBlob,
      "audio.webm"
    );

    return this.fetch<TranscriptionResponse>(
      "/transcribe",
      {
        method: "POST",
        body: formData
      }
    );
  }


  async getReport(
    sessionId: string
  ): Promise<ReportResponse> {

    return this.fetch<ReportResponse>(
      `/interview/${sessionId}/report`
    );
  }


  async getHistory(): Promise<HistoryRecord[]> {

    return this.fetch<HistoryRecord[]>(
      "/interviews"
    );
  }
}


export const apiClient =
  new ApiClient();