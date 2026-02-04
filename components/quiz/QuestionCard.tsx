"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuizQuestion } from "@/lib/types";

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (questionId: string, answer: string) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuestionCardProps) {
  return (
    <Card className="w-full border-[3px] border-black rounded-[25px] shadow-none bg-white">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              Question {questionNumber} of {totalQuestions}
            </p>
            <h2 className="text-lg md:text-xl font-bold text-center leading-tight">
              {question.question}
            </h2>
          </div>

          <RadioGroup
            onValueChange={(value) => onAnswer(question.id, value)}
            className="space-y-2"
          >
            {question.options.map((option, index) => (
              <div
                key={option.value}
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
              >
                <Label
                  htmlFor={`${question.id}-option-${index}`}
                  className="flex items-start gap-3 p-4 border border-black rounded-xl cursor-pointer
                    hover:border-black hover:bg-gray-50 hover:scale-[1.01]
                    active:scale-[0.99] transition-all duration-200"
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`${question.id}-option-${index}`}
                    className="mt-1 shrink-0"
                  />
                  <span className="text-sm md:text-base leading-relaxed">
                    {option.label}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
