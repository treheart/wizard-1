"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import quizContent from "@/content/quiz.json";

interface NameInputProps {
  initialEmail?: string;
  onSubmit: (name: string, email: string) => void;
}

export function NameInput({ initialEmail = "", onSubmit }: NameInputProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onSubmit(name.trim(), email.trim());
    }
  };

  const nameInput = quizContent.nameInput as {
    heading: string;
    label: string;
    placeholder: string;
    emailLabel?: string;
    emailPlaceholder?: string;
    button: string;
  };

  return (
    <Card className="w-full border-[3px] border-black rounded-[25px] shadow-none bg-white">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">
              {nameInput.heading}
            </h1>
          </div>

          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              {nameInput.label}
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder={nameInput.placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base md:text-lg h-12 md:h-14 transition-all focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {nameInput.emailLabel ?? "Email:"}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={nameInput.emailPlaceholder ?? "Enter your email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-base md:text-lg h-12 md:h-14 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || !email.trim()}
            className="w-full h-12 md:h-14 text-base md:text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
          >
            {nameInput.button}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
