"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
