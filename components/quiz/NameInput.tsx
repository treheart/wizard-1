"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import quizContent from "@/content/quiz.json";

interface NameInputProps {
  onSubmit: (name: string) => void;
}

export function NameInput({ onSubmit }: NameInputProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <Card className="w-full border-[3px] border-black rounded-[25px] shadow-none bg-white">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">
              {quizContent.nameInput.heading}
            </h1>
          </div>

          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              {quizContent.nameInput.label}
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder={quizContent.nameInput.placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base md:text-lg h-12 md:h-14 transition-all focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full h-12 md:h-14 text-base md:text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
          >
            {quizContent.nameInput.button}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
