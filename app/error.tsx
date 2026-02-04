"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (replace with error tracking service in production)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-[3px] border-black rounded-[25px] shadow-none">
        <CardContent className="p-8 text-center space-y-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wizard.png"
            alt="Wizard"
            width={80}
            height={80}
            className="mx-auto opacity-50"
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              We encountered an unexpected error. Please try again.
            </p>
          </div>
          <Button
            onClick={reset}
            className="h-12 px-8 text-base font-bold bg-black text-white hover:bg-black/90"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
