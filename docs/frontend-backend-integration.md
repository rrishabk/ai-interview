# Frontend-Backend Integration Map

Based on a thorough inspection of the repository, the backend implementation is completely missing at this stage. Therefore, all required integration points are marked as missing contracts. 

Below is the proposed integration contract required to support the AI Interview frontend. This specifies the smallest backend addition necessary to fulfill the architecture requirements.

## 1. Resume upload flow
- **Status**: MISSING BACKEND CONTRACT
- **Proposed Endpoint**: `POST /api/resume/upload`
- **HTTP Method**: POST
- **Request Payload**: `multipart/form-data` with a `file` field (PDF or Text).
- **Response Payload**: `{ "resumeId": "string", "status": "processing" }`
- **Error States**: `400 Bad Request` (Invalid file type), `413 Payload Too Large`.
- **Frontend Component**: `ResumeUploadDropzone` (on `/setup`)

## 2. Resume processing flow
- **Status**: MISSING BACKEND CONTRACT
- **Proposed Endpoint**: `GET /api/resume/{resumeId}/status`
- **HTTP Method**: GET
- **Request Payload**: None.
- **Response Payload**: `{ "resumeId": "string", "status": "completed", "extractedSkills": ["React", "TypeScript"] }`
- **Error States**: `404 Not Found` (Invalid resumeId), `500 Internal Server Error` (Processing failed).
- **Frontend Component**: `SetupProgressLog` (polls until processing is complete)

## 3. RAG/vector retrieval flow
- **Status**: MISSING BACKEND CONTRACT
- **Proposed Endpoint**: Internal backend process only. (Triggered during Question Generation and Answer Evaluation). No direct frontend endpoint required.
- **Frontend Component**: N/A (Abstracted from frontend)

## 4. Question generation
- **Status**: MISSING BACKEND CONTRACT
- **Proposed Endpoint**: Internal orchestration triggered when an interview session starts or generated dynamically during the WebSocket session.
- **Frontend Component**: N/A

## 5. Ollama/LangChain interaction
- **Status**: MISSING BACKEND CONTRACT
- **Proposed Endpoint**: Internal orchestration.
- **Frontend Component**: N/A

## 6. Interview session creation
- **Status**: MISSING BACKEND CONTRACT
- **Proposed Endpoint**: `POST /api/interview/start`
- **HTTP Method**: POST
- **Request Payload**: `{ "resumeId": "string", "role": "string" }`
- **Response Payload**: `{ "sessionId": "string", "websocketUrl": "wss://[host]/interview/stream?sessionId=..." }`
- **Error States**: `400 Bad Request` (Missing parameters), `404 Not Found` (Resume not processed).
- **Frontend Component**: `StartInterviewCommand`

## 7. WebSocket connection
- **Status**: MISSING BACKEND CONTRACT
- **Proposed Endpoint**: `wss://[host]/interview/stream?sessionId={sessionId}`
- **WebSocket Event (Server -> Client)**: `{ "event": "connected", "status": "ready" }`
- **Error States**: Connection drop (1006), Unauthorized handshake.
- **Frontend Component**: `InterviewWebSocketProvider`

## 8. Audio streaming
- **Status**: MISSING BACKEND CONTRACT
- **Proposed WebSocket Event (Client -> Server)**: 
  - `event: "audio_chunk"`
  - `payload: { "data": "base64_encoded_pcm_audio", "timestamp": 1234567890 }`
- **Error States**: Malformed audio payload, WS connection timeout.
- **Frontend Component**: `MicrophoneStreamManager`

## 9. Whisper transcription
- **Status**: MISSING BACKEND CONTRACT
- **Proposed WebSocket Event (Server -> Client)**: 
  - `event: "transcript_update"`
  - `payload: { "text": "string", "isFinal": boolean }`
- **Frontend Component**: `TranscriptTerminal`

## 10. SER processing (Speech Emotion Recognition)
- **Status**: MISSING BACKEND CONTRACT
- **Proposed WebSocket Event (Server -> Client)**: 
  - `event: "ser_analysis"`
  - `payload: { "emotion": "string", "confidenceScore": number }`
- **Frontend Component**: `TechnicalMetadataPanel`

## 11. DeepFace processing
- **Status**: MISSING BACKEND CONTRACT
- **Proposed WebSocket Event (Client -> Server)**: 
  - `event: "video_frame"`
  - `payload: { "image": "base64_encoded_jpeg" }`
- **Proposed WebSocket Event (Server -> Client)**: 
  - `event: "deepface_analysis"`
  - `payload: { "emotion": "string", "attentionScore": number }`
- **Frontend Component**: `VideoFrameExtractor` & `TechnicalMetadataPanel`

## 12. Answer evaluation
- **Status**: MISSING BACKEND CONTRACT
- **Proposed WebSocket Event (Server -> Client)**: 
  - `event: "evaluation_result"`
  - `payload: { "score": number, "feedback": "string", "competency": "string" }`
- **Frontend Component**: `ScoreIndicator` & `TranscriptTerminal`

## 13. Score generation
- **Status**: MISSING BACKEND CONTRACT
- **Proposed Endpoint**: Aggregated internally and sent via WebSocket `evaluation_result` event, or retrieved at the end of the session.
- **Frontend Component**: `TechnicalMetadataPanel`

## 14. Next-question generation
- **Status**: MISSING BACKEND CONTRACT
- **Proposed WebSocket Event (Server -> Client)**: 
  - `event: "next_question"`
  - `payload: { "questionText": "string", "audioUrl": "string (optional)" }`
- **Frontend Component**: `QuestionDisplay`

## 15. Final report generation
- **Status**: MISSING BACKEND CONTRACT
- **Proposed Endpoint**: `GET /api/interview/{sessionId}/report`
- **HTTP Method**: GET
- **Request Payload**: None.
- **Response Payload**: `{ "sessionId": "string", "overallScore": number, "strengths": ["string"], "weaknesses": ["string"], "fullTranscript": [{ "speaker": "string", "text": "string" }] }`
- **Error States**: `404 Not Found` (Invalid sessionId or report still generating).
- **Frontend Component**: `ReportDocumentView`
