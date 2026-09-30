Fine-Tuned Whisper Speech Recognition

1. Project Overview

This project fine-tunes the OpenAI Whisper Tiny model for English automatic speech recognition (ASR) using the nyralabs/disfluency_speech_english dataset.

The trained model is also tested locally with microphone input to perform speech-to-text transcription.

2. Dataset Information

Dataset: nyralabs/disfluency_speech_english

Task: Automatic Speech Recognition (ASR)

Language: English

Source: Hugging Face

The dataset contains conversational English speech with disfluencies such as repetitions, fillers, cut-offs, and other speech phenomena.

Dataset Size

Property

Value

Vocab size: 51865

Total utterances

4,957

Training samples

4,458

Validation samples

250

Test samples

249

Total audio duration

~9.4 hours

Dataset size

~1.06 GB

Approx. average audio duration

~6.82 seconds

The approximate average audio duration is calculated from the reported total duration and total number of utterances.

Dataset Features

The dataset contains the following important fields:

id

audio

duration_in_s

split

speaker

verbatim_transcript

intended_transcript

Transcript Types

Verbatim Transcript

Represents what was actually spoken, including speech disfluencies and sound events.

Intended Transcript

Represents the intended or cleaned form of the spoken content.

3. Model Information

Base Model: openai/whisper-tiny

Task: Speech-to-text

Language: English

Audio Sampling Rate: 16 kHz

The fine-tuned model weights are stored in:

model.safetensors

4. Fine-Tuning Configuration

Parameter

Value

Base model

openai/whisper-tiny

Language

English

Sampling rate

16,000 Hz

Training batch size

8

Evaluation batch size

8

Learning rate

1.75e-5

Warmup steps

20,000

Training strategy

Epoch

Number of epochs

10

Gradient checkpointing

Enabled

Mixed precision

FP16

Training GPU

NVIDIA Tesla T4

Dataset loading

Dynamic from Hugging Face

The dataset was loaded dynamically from Hugging Face rather than from a locally saved dataset.

5. Training Process

The overall training pipeline was:

Hugging Face Dataset
        ↓
Audio Resampling to 16 kHz
        ↓
Audio and Transcript Preprocessing
        ↓
Whisper Feature Extraction
        ↓
Tokenization
        ↓
Whisper Fine-Tuning
        ↓
Validation
        ↓
Final Model

Audio samples longer than 30 seconds were filtered during preprocessing, and transcript labels were prepared for Whisper training.

6. Evaluation

The final model was evaluated on the 249-sample test split.

Final Results

Metric

Result

WER

17.33%

CER

8.31%

Normalized WER

6.29%

Normalized CER

3.53%

Metric Description

WER (Word Error Rate)
Measures the percentage of word-level transcription errors.

CER (Character Error Rate)
Measures the percentage of character-level transcription errors.

Normalized WER
WER calculated after applying text normalization.

Normalized CER
CER calculated after applying text normalization.

Lower values represent fewer transcription errors.

7. Local Inference

After training and evaluation, the fine-tuned model was loaded locally using Python and tested with a microphone.

The current implementation works using 5-second audio chunks:

Microphone
    ↓
5-second Audio Recording
    ↓
Fine-Tuned Whisper Model
    ↓
Speech-to-Text
    ↓
Transcribed Text

Example output:

Listening...
Speak for 5 seconds...

You said: Thank you.

Another test produced:

Listening...
Speak for 5 seconds...

You said: you

The current implementation is chunk-based transcription rather than true word-by-word streaming.

8. Model Files

The final model directory contains the trained model and required configuration/tokenizer files:

final_whisper_tuned_model/
│
├── src/
│   └── live_transcription.py
│
├── model.safetensors
├── config.json
├── generation_config.json
├── processor_config.json
├── preprocessor_config.json
│
├── tokenizer.json
├── tokenizer_config.json
├── vocab.json
├── merges.txt
├── normalizer.json
├── added_tokens.json
├── special_tokens_map.json
│
├── requirements.txt
└── README.md

9. Local Execution

Install the required dependencies:

pip install -r requirements.txt

Required packages:

torch
transformers
sounddevice
numpy
scipy

Run the local transcription system:

python src/live_transcription.py

The application records a 5-second audio segment, passes it through the fine-tuned Whisper model, and prints the generated transcription.

Press Ctrl + C to stop the application.

10. Final Project Summary

Category

Details

Model

Whisper Tiny

Dataset

nyralabs/disfluency_speech_english

Total samples

4,957

Training samples

4,458

Validation samples

250

Test samples

249

Total audio

~9.4 hours

Dataset size

~1.06 GB

Approx. average audio length

~6.82 seconds

Training hardware

NVIDIA Tesla T4

Final WER

17.33%

Final CER

8.31%

Normalized WER

6.29%

Normalized CER

3.53%

Local inference

Successfully tested

Current inference mode

5-second audio chunks

11. End-to-End Workflow

Dataset
   ↓
Data Preprocessing
   ↓
Audio Resampling
   ↓
Feature Extraction
   ↓
Tokenization
   ↓
Whisper Tiny Fine-Tuning
   ↓
Validation
   ↓
Test Evaluation
   ↓
Final Fine-Tuned Model
   ↓
Local Microphone Testing
   ↓
English Speech Transcription