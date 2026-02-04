import { Path, PathResult, QuizQuestion } from "./types";
import quizContent from "@/content/quiz.json";
import resultsContent from "@/content/results.json";

// Helper to convert JSON question format to QuizQuestion format
function createQuestion(id: string, path: Path | "global", questionData: { question: string; options: { label: string; value: string }[] }): QuizQuestion {
  return {
    id,
    path,
    question: questionData.question,
    options: questionData.options,
  };
}

export const segmentSplitterQuestion: QuizQuestion = {
  id: "segment",
  path: "global",
  question: quizContent.segmentSplitter.question,
  options: quizContent.segmentSplitter.options,
};

export const pathAQuestions: QuizQuestion[] = [
  createQuestion("Q1A", "A", quizContent.pathA.Q1A),
  createQuestion("Q2A", "A", quizContent.pathA.Q2A),
  createQuestion("Q3A", "A", quizContent.pathA.Q3A),
];

export const pathBQuestions: QuizQuestion[] = [
  createQuestion("Q1B", "B", quizContent.pathB.Q1B),
  createQuestion("Q2B", "B", quizContent.pathB.Q2B),
  createQuestion("Q3B", "B", quizContent.pathB.Q3B),
];

export const pathCQuestions: QuizQuestion[] = [
  createQuestion("Q1C", "C", quizContent.pathC.Q1C),
  createQuestion("Q2C", "C", quizContent.pathC.Q2C),
  createQuestion("Q3C", "C", quizContent.pathC.Q3C),
];

export const pathResults: Record<Path, PathResult> = {
  A: {
    path: "A",
    title: resultsContent.pathResults.A.title,
    subtitle: resultsContent.pathResults.A.subtitle,
    description: resultsContent.pathResults.A.description,
    tags: resultsContent.pathResults.A.tags,
    insights: resultsContent.pathResults.A.insights,
  },
  B: {
    path: "B",
    title: resultsContent.pathResults.B.title,
    subtitle: resultsContent.pathResults.B.subtitle,
    description: resultsContent.pathResults.B.description,
    tags: resultsContent.pathResults.B.tags,
    insights: resultsContent.pathResults.B.insights,
  },
  C: {
    path: "C",
    title: resultsContent.pathResults.C.title,
    subtitle: resultsContent.pathResults.C.subtitle,
    description: resultsContent.pathResults.C.description,
    tags: resultsContent.pathResults.C.tags,
    insights: resultsContent.pathResults.C.insights,
  },
};

export function getQuestionsForPath(path: Path): QuizQuestion[] {
  switch (path) {
    case "A":
      return pathAQuestions;
    case "B":
      return pathBQuestions;
    case "C":
      return pathCQuestions;
  }
}

export const TOTAL_PATH_QUESTIONS = 3;

// Export content for use in components
export { quizContent, resultsContent };
