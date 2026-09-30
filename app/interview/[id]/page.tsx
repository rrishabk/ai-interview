"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";

import { useParams } from "next/navigation";

import { apiClient } from "../../../services/apiClient";

import styles from "./InterviewRoom.module.css";


export default function InterviewPage() {

  const params = useParams();

  const sessionId =
    params.id as string;


  const [
    isListening,
    setIsListening
  ] = useState(false);


  const [
    status,
    setStatus
  ] = useState("Ready");


  const [
    transcript,
    setTranscript
  ] = useState("");


  const streamRef =
    useRef<MediaStream | null>(null);


  const recorderRef =
    useRef<MediaRecorder | null>(null);


  const recordingRef =
    useRef(false);


  const timerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);


  const chunksRef =
    useRef<Blob[]>([]);


  const startNextRecording =
    (stream: MediaStream) => {

      if (!recordingRef.current) {
        return;
      }


      chunksRef.current = [];


      let recorder: MediaRecorder;


      try {

        recorder =
          new MediaRecorder(
            stream,
            {
              mimeType: "audio/webm"
            }
          );

      } catch (error) {

        console.error(
          "MediaRecorder error:",
          error
        );

        setStatus(
          "Audio recording is not supported"
        );

        return;
      }


      recorderRef.current =
        recorder;


      recorder.ondataavailable =
        event => {

          if (
            event.data &&
            event.data.size > 0
          ) {

            chunksRef.current.push(
              event.data
            );
          }
        };


      recorder.onstop =
        async () => {

          if (
            chunksRef.current.length === 0
          ) {

            if (
              recordingRef.current
            ) {

              startNextRecording(
                stream
              );
            }

            return;
          }


          const audioBlob =
            new Blob(
              chunksRef.current,
              {
                type: "audio/webm"
              }
            );


          chunksRef.current = [];


          await sendAudio(
            audioBlob
          );


          if (
            recordingRef.current
          ) {

            startNextRecording(
              stream
            );
          }
        };


      recorder.onerror =
        event => {

          console.error(
            "MediaRecorder error:",
            event
          );

          setStatus(
            "Recording error"
          );
        };


      recorder.start();


      setStatus(
        "Listening..."
      );


      timerRef.current =
        setTimeout(() => {

          if (
            recorder.state ===
            "recording"
          ) {

            recorder.stop();
          }

        }, 5000);
    };


  const sendAudio =
    async (
      audioBlob: Blob
    ) => {

      if (
        audioBlob.size === 0
      ) {

        return;
      }


      try {

        setStatus(
          "Transcribing..."
        );


        console.log(
          "Sending audio:",
          audioBlob.size,
          "bytes"
        );


        const result =
          await apiClient.transcribeAudio(
            audioBlob
          );


        console.log(
          "Transcription result:",
          result
        );


        if (
          !result.success
        ) {

          console.error(
            result.error
          );

          setStatus(
            "Transcription failed"
          );

          return;
        }


        if (
          result.text
        ) {

          const text =
            result.text.trim();


          if (
            text
          ) {

            setTranscript(
              previous => {

                if (
                  !previous
                ) {

                  return text;
                }


                return `${previous} ${text}`;
              }
            );
          }
        }


      } catch (error) {

        console.error(
          "Transcription error:",
          error
        );

        setStatus(
          "Backend connection failed"
        );
      }
    };


  const startListening =
    async () => {

      try {

        setStatus(
          "Requesting microphone..."
        );


        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true
            }
          );


        streamRef.current =
          stream;


        recordingRef.current =
          true;


        setIsListening(
          true
        );


        startNextRecording(
          stream
        );

      } catch (error) {

        console.error(
          "Microphone error:",
          error
        );


        setStatus(
          "Microphone permission denied"
        );
      }
    };


  const stopListening =
    () => {

      recordingRef.current =
        false;


      if (
        timerRef.current
      ) {

        clearTimeout(
          timerRef.current
        );

        timerRef.current =
          null;
      }


      const recorder =
        recorderRef.current;


      if (
        recorder &&
        recorder.state ===
          "recording"
      ) {

        recorder.stop();
      }


      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            track =>
              track.stop()
          );


        streamRef.current =
          null;
      }


      setIsListening(
        false
      );


      setStatus(
        "Ready"
      );
    };


  useEffect(() => {

    return () => {

      recordingRef.current =
        false;


      if (
        timerRef.current
      ) {

        clearTimeout(
          timerRef.current
        );
      }


      if (
        recorderRef.current &&
        recorderRef.current.state ===
          "recording"
      ) {

        recorderRef.current.stop();
      }


      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            track =>
              track.stop()
          );
      }

    };

  }, []);


  return (

    <main
      className={styles.page}
    >

      <div
        className={styles.container}
      >

        <div
          className={styles.header}
        >

          <div>
            AI INTERVIEW
          </div>

          <div
            className={styles.session}
          >
            Session Active
          </div>

        </div>


        <div
          className={styles.interviewArea}
        >

          <div
            className={styles.statusText}
          >
            {isListening
              ? "LISTENING..."
              : "READY"}
          </div>


          <button
            type="button"
            className={`${styles.micButton} ${
              isListening
                ? styles.micButtonActive
                : ""
            }`}
            onClick={
              isListening
                ? stopListening
                : startListening
            }
            aria-label={
              isListening
                ? "Stop microphone"
                : "Start microphone"
            }
          >

            <span>
              🎙
            </span>

          </button>


          <div
            className={styles.micLabel}
          >
            {isListening
              ? "Listening..."
              : "Tap to speak"}
          </div>


          <div
            className={styles.captionBox}
          >

            {transcript ? (

              <div
                className={styles.caption}
              >
                {transcript}
              </div>

            ) : (

              <div
                className={styles.placeholder}
              >
                Transcript will appear here
              </div>

            )}

          </div>


          <div
            className={styles.backendStatus}
          >

            <span
              className={
                isListening
                  ? styles.activeDot
                  : styles.inactiveDot
              }
            />

            {status}

          </div>

        </div>

      </div>

    </main>
  );
}