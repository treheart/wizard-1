export type Path = "A" | "B" | "C";

export interface QuizOption {
  label: string;
  value: string;
}

export interface QuizQuestion {
  id: string;
  path: Path | "global";
  question: string;
  options: QuizOption[];
}

export interface PathResult {
  path: Path;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  insights: string[];
}

export interface QuizState {
  currentStep: number;
  firstName: string;
  email: string;
  ref: string;
  selectedPath: Path | null;
  answers: Record<string, string>;
}

export interface SubscribeRequest {
  email: string;
  firstName: string;
  path: Path;
  result: string;
}
