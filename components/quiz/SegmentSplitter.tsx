"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { segmentSplitterQuestion } from "@/lib/quiz-data";
import { Path } from "@/lib/types";

interface SegmentSplitterProps {
  firstName: string;
  onSelect: (path: Path) => void;
}

export function SegmentSplitter({ firstName, onSelect }: SegmentSplitterProps) {
  const question = segmentSplitterQuestion.question.replace("{name}", firstName);

  return (
    <Card className="w-full border-[3px] border-[#222222FF] rounded-[25px] shadow-none bg-white">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-6">
          <h2 className="text-lg md:text-xl font-bold text-center leading-tight">
            {question}
          </h2>

          <RadioGroup
            onValueChange={(value) => onSelect(value as Path)}
            className="space-y-3"
          >
            {segmentSplitterQuestion.options.map((option, index) => (
              <div
                key={option.value}
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <Label
                  htmlFor={`option-${index}`}
                  className="flex items-start gap-3 p-4 border-2 border-black rounded-xl cursor-pointer
                    hover:border-black hover:bg-gray-50 hover:scale-[1.01]
                    active:scale-[0.99] transition-all duration-200"
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`option-${index}`}
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
