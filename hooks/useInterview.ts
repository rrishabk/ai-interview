"use client";

import { useState, useEffect } from "react";

import { useWebSocket } from "./useWebSocket";

import {
  InterviewState,
  QuestionPayload,
  TranscriptPayload
} from "../services/interviewSocket";

import { useRouter } from "next/navigation";

export function useInterview(sessionId: string) {

  const {
    status,
    lastEvent,
    sendAudio,
    sendVideo
  } = useWebSocket(sessionId);

  const router = useRouter();

  const [
    interviewState,
    setInterviewState
  ] = useState<InterviewState>("setup");

  const [
    currentQuestion,
    setCurrentQuestion
  ] = useState<QuestionPayload | null>(null);

  const [
    transcript,
    setTranscript
  ] = useState<TranscriptPayload[]>([]);

  const [
    timeRemaining,
    setTimeRemaining
  ] = useState<number>(45 * 60);


  useEffect(() => {

    if (!lastEvent) {
      return;
    }

    switch (lastEvent.event) {

      case "question":

      case "next_question":

        setCurrentQuestion(
          lastEvent.payload
        );

        setInterviewState(
          "listening"
        );

        break;


      case "transcript_update":

        setTranscript(prev => {

          const p =
            lastEvent.payload;

          const newTranscript =
            [...prev];

          const last =
            newTranscript[
              newTranscript.length - 1
            ];

          if (
            last &&
            last.speaker === p.speaker &&
            !last.isFinal
          ) {

            newTranscript[
              newTranscript.length - 1
            ] = p;

          } else {

            newTranscript.push(p);
          }

          return newTranscript;
        });

        break;


      case "analysis":

        setInterviewState(
          "processing"
        );

        break;


      case "evaluation_result":

        setInterviewState(
          "evaluating"
        );

        break;


      case "completed":

        setInterviewState(
          "completed"
        );

        router.push(
          `/reports/${sessionId}`
        );

        break;


      case "error":

        console.error(
          "Interview Error Payload:",
          lastEvent.payload
        );

        break;
    }

  }, [
    lastEvent,
    router,
    sessionId
  ]);


  useEffect(() => {

    if (
      status !== "connected" ||
      interviewState === "completed"
    ) {
      return;
    }

    const interval =
      setInterval(() => {

        setTimeRemaining(
          prev =>
            Math.max(0, prev - 1)
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [
    status,
    interviewState
  ]);


  const formattedTime =
    `${String(
      Math.floor(timeRemaining / 60)
    ).padStart(2, "0")}:${String(
      timeRemaining % 60
    ).padStart(2, "0")}`;


  const endInterview = () => {

    setInterviewState(
      "completed"
    );

    router.push(
      `/reports/${sessionId}`
    );
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