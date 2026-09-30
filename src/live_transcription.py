import os
import torch
import sounddevice as sd
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

SAMPLE_RATE = 16000
CHUNK_SECONDS = 5


def load_model():
    print("Loading fine-tuned Whisper model...")
    print(f"Model path: {MODEL_DIR}")

    if not os.path.exists(os.path.join(MODEL_DIR, "model.safetensors")):
        raise FileNotFoundError("model.safetensors not found.")

    print("Loading tokenizer...")

    tokenizer = WhisperTokenizer.from_pretrained(
        MODEL_DIR,
        language="english",
        task="transcribe",
        local_files_only=True
    )

    print("Loading feature extractor...")

    feature_extractor = WhisperFeatureExtractor.from_pretrained(
        "openai/whisper-tiny"
    )

    processor = WhisperProcessor(
        feature_extractor=feature_extractor,
        tokenizer=tokenizer
    )

    print("Loading fine-tuned model...")

    model = WhisperForConditionalGeneration.from_pretrained(
        MODEL_DIR,
        local_files_only=True
    )

    if torch.cuda.is_available():
        device = 0
        model = model.half()
        print("Device: CUDA GPU")
    else:
        device = -1
        print("Device: CPU")

    pipe = pipeline(
        task="automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        device=device
    )

    return pipe


def record_audio():
    print("\nListening...")
    print(f"Speak for {CHUNK_SECONDS} seconds...")

    audio = sd.rec(
        int(CHUNK_SECONDS * SAMPLE_RATE),
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype="float32"
    )

    sd.wait()

    return audio.flatten()


def transcribe(pipe, audio):
    result = pipe(
        {
            "raw": audio,
            "sampling_rate": SAMPLE_RATE
        },
        generate_kwargs={
            "language": "english",
            "task": "transcribe"
        }
    )

    return result["text"].strip()


def main():
    print("=" * 50)
    print("Fine-Tuned Whisper - Live Transcription")
    print("=" * 50)

    pipe = load_model()

    print("\nModel loaded successfully!")
    print("Press Ctrl+C to stop.")

    try:
        while True:
            audio = record_audio()

            text = transcribe(pipe, audio)

            if text:
                print(f"\nYou said: {text}")
            else:
                print("\nNo speech detected.")

    except KeyboardInterrupt:
        print("\n\nTranscription stopped.")


if __name__ == "__main__":
    main()