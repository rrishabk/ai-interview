import os
import uuid
import tempfile
import subprocess
import json

import torch
import soundfile as sf

from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from transformers import (
    WhisperForConditionalGeneration,
    WhisperFeatureExtractor,
    WhisperTokenizer,
    WhisperProcessor,
    pipeline
)


MODEL_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

UPLOAD_DIR = os.path.join(
    MODEL_DIR,
    "uploads"
)

os.makedirs(UPLOAD_DIR, exist_ok=True)


app = FastAPI(
    title="AI Interview Backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


whisper_pipe = None


class StartInterviewRequest(BaseModel):
    resumeId: str
    role: str
    company: str
    type: str
    difficulty: str


def load_whisper_model():

    global whisper_pipe

    print("=" * 60)
    print("LOADING FINE-TUNED WHISPER")
    print("=" * 60)

    print(f"Model directory: {MODEL_DIR}")

    model_file = os.path.join(
        MODEL_DIR,
        "model.safetensors"
    )

    if not os.path.exists(model_file):
        raise FileNotFoundError(
            f"model.safetensors not found: {model_file}"
        )

    print("Loading tokenizer...")

    tokenizer = WhisperTokenizer.from_pretrained(
        MODEL_DIR,
        language="english",
        task="transcribe",
        local_files_only=True
    )

    print("Loading feature extractor...")

    feature_extractor = WhisperFeatureExtractor.from_pretrained(
        MODEL_DIR,
        local_files_only=True
    )

    processor = WhisperProcessor(
        feature_extractor=feature_extractor,
        tokenizer=tokenizer
    )

    print("Loading YOUR fine-tuned model...")

    model = WhisperForConditionalGeneration.from_pretrained(
        MODEL_DIR,
        local_files_only=True
    )

    if torch.cuda.is_available():

        device = 0

        model = model.half()

        print("Device: CUDA")
        print(
            f"GPU: {torch.cuda.get_device_name(0)}"
        )

    else:

        device = -1

        print("Device: CPU")

    whisper_pipe = pipeline(
        task="automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        device=device
    )

    print("=" * 60)
    print("YOUR FINE-TUNED WHISPER LOADED")
    print("=" * 60)


@app.on_event("startup")
def startup_event():

    load_whisper_model()


@app.get("/")
def root():

    return {
        "message": "AI Interview Backend is running",
        "status": "success"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "whisper_loaded": whisper_pipe is not None,
        "model_path": MODEL_DIR
    }


@app.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...)
):

    if not file.filename:

        return {
            "success": False,
            "error": "No filename provided"
        }

    resume_id = str(uuid.uuid4())

    extension = os.path.splitext(
        file.filename
    )[1]

    saved_filename = (
        f"{resume_id}{extension}"
    )

    saved_path = os.path.join(
        UPLOAD_DIR,
        saved_filename
    )

    contents = await file.read()

    with open(saved_path, "wb") as f:
        f.write(contents)

    print(
        f"Resume uploaded: {file.filename}"
    )

    return {
        "success": True,
        "resumeId": resume_id,
        "filename": file.filename,
        "status": "uploaded"
    }


@app.post("/interview/start")
async def start_interview(
    request: StartInterviewRequest
):

    session_id = str(uuid.uuid4())

    session_data = {
        "sessionId": session_id,
        "resumeId": request.resumeId,
        "role": request.role,
        "company": request.company,
        "type": request.type,
        "difficulty": request.difficulty
    }

    session_file = os.path.join(
        UPLOAD_DIR,
        f"session_{session_id}.json"
    )

    with open(
        session_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            session_data,
            f,
            indent=2
        )

    print("=" * 60)
    print("INTERVIEW STARTED")
    print(f"Session ID: {session_id}")
    print(f"Company: {request.company}")
    print(f"Role: {request.role}")
    print(f"Type: {request.type}")
    print(f"Difficulty: {request.difficulty}")
    print("=" * 60)

    return {
        "success": True,
        "message": "Interview started successfully",
        "sessionId": session_id,
        "data": session_data
    }


@app.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...)
):

    global whisper_pipe

    if whisper_pipe is None:

        return {
            "success": False,
            "error": "Whisper model is not loaded"
        }

    audio_bytes = await audio.read()

    if not audio_bytes:

        return {
            "success": False,
            "error": "Empty audio file"
        }

    input_path = None
    wav_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".webm"
        ) as temp_file:

            temp_file.write(audio_bytes)
            input_path = temp_file.name

        wav_path = input_path.replace(
            ".webm",
            ".wav"
        )

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                input_path,
                "-ar",
                "16000",
                "-ac",
                "1",
                wav_path
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        speech, sampling_rate = sf.read(
            wav_path,
            dtype="float32"
        )

        if len(speech) == 0:

            return {
                "success": False,
                "error": "No speech detected"
            }

        print(
            f"Transcribing "
            f"{len(speech) / sampling_rate:.2f} seconds"
        )

        result = whisper_pipe(
            {
                "raw": speech,
                "sampling_rate": sampling_rate
            },
            generate_kwargs={
                "language": "english",
                "task": "transcribe"
            }
        )

        text = result["text"].strip()

        print(
            f"Transcript: {text}"
        )

        return {
            "success": True,
            "text": text
        }

    except Exception as e:

        print(
            "TRANSCRIPTION ERROR:",
            repr(e)
        )

        return {
            "success": False,
            "error": str(e)
        }

    finally:

        if input_path and os.path.exists(input_path):

            try:
                os.remove(input_path)
            except Exception:
                pass

        if wav_path and os.path.exists(wav_path):

            try:
                os.remove(wav_path)
            except Exception:
                pass