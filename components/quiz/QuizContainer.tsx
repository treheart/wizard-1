"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NameInput } from "./NameInput";
import { SegmentSplitter } from "./SegmentSplitter";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { Path, QuizState } from "@/lib/types";
import { getQuestionsForPath, TOTAL_PATH_QUESTIONS } from "@/lib/quiz-data";
import { encodeQuizData } from "@/lib/answer-encoding";
import commonContent from "@/content/common.json";

type QuizStep = "name" | "segment" | "questions" | "loading";

export function QuizContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<QuizStep>("name");
  const [pendingResultsId, setPendingResultsId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<QuizState>({
    currentStep: 0,
    firstName: "",
    email: "",
    ref: "",
    selectedPath: null,
    answers: {},
  });

  // Read URL params on mount
  useEffect(() => {
    const email = searchParams.get("email") || "";
    const ref = searchParams.get("ref") || "";
    setState((prev) => ({ ...prev, email, ref }));
  }, [searchParams]);

  const handleNameSubmit = (name: string, email: string) => {
    setState((prev) => ({ ...prev, firstName: name, email }));
    setStep("segment");
  };

  const INTAKE_ANSWER_BY_PATH: Record<Path, string> = {
    A: "beginner",
    B: "solo operator",
    C: "experience designer",
  };

  const handlePathSelect = async (path: Path) => {
    const answer = INTAKE_ANSWER_BY_PATH[path];
    const email = state.email || "";
    const name = state.firstName || "";

    if (email && name) {
      try {
        await fetch("/api/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, answer }),
        });
      } catch {
        // Fire-and-forget; don't block quiz flow
      }
    }

    setState((prev) => ({ ...prev, selectedPath: path, currentStep: 0 }));
    setStep("questions");
  };

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...state.answers, [questionId]: answer };
    const newStep = state.currentStep + 1;

    setState((prev) => ({
      ...prev,
      answers: newAnswers,
      currentStep: newStep,
    }));

    // Check if this was the last question - show loading screen
    if (newStep >= TOTAL_PATH_QUESTIONS) {
      const id = encodeQuizData(
        state.firstName,
        state.selectedPath!,
        newAnswers,
        state.email || undefined
      );
      setPendingResultsId(id);
      setStep("loading");
    }
  };

  // Handle loading screen timeout
  useEffect(() => {
    if (step === "loading" && pendingResultsId) {
      const timer = setTimeout(() => {
        router.push(`/results?id=${pendingResultsId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, pendingResultsId, router]);

  const getCurrentQuestion = () => {
    if (!state.selectedPath) return null;
    const questions = getQuestionsForPath(state.selectedPath);
    return questions[state.currentStep];
  };

  const getTotalProgress = () => {
    // 2 global questions + path questions
    const totalSteps = 2 + TOTAL_PATH_QUESTIONS;
    let completedSteps = 0;

    if (step === "segment") completedSteps = 1;
    else if (step === "questions") completedSteps = 2 + state.currentStep;

    return { current: completedSteps, total: totalSteps };
  };

  const progress = getTotalProgress();

  // Create a unique key for animation triggers
  const animationKey = step === "questions" ? `${step}-${state.currentStep}` : step;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 md:p-8">
      <div className="w-full max-w-xl space-y-6 md:space-y-8">
        {/* Progress Bar - show after name input, hide during loading */}
        {step !== "name" && step !== "loading" && (
          <div className="animate-fade-in">
            <ProgressBar current={progress.current} total={progress.total} />
          </div>
        )}

        {/* Quiz Steps with animations */}
        <div key={animationKey} className="animate-fade-in-up">
          {step === "name" && (
            <NameInput
              initialEmail={state.email}
              onSubmit={handleNameSubmit}
            />
          )}

          {step === "segment" && (
            <SegmentSplitter
              firstName={state.firstName}
              onSelect={handlePathSelect}
            />
          )}

          {step === "questions" && state.selectedPath && state.currentStep < TOTAL_PATH_QUESTIONS && (
            <QuestionCard
              question={getCurrentQuestion()!}
              questionNumber={state.currentStep + 1}
              totalQuestions={TOTAL_PATH_QUESTIONS}
              onAnswer={handleAnswer}
            />
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                loop
                className="w-48 h-48 md:w-64 md:h-64"
              >
                <source src="/thinking.mp4" type="video/mp4" />
              </video>
              <p className="text-lg font-medium text-gray-700 animate-pulse">
                {commonContent.loading.analyzingAnswers}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
