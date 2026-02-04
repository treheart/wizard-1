"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { decodeQuizData } from "@/lib/answer-encoding";
import { pathResults } from "@/lib/quiz-data";
import { Path } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import resultsContent from "@/content/results.json";
import commonContent from "@/content/common.json";

// Generate personalized insights based on answers
function getPersonalizedInsights(path: Path, answers: Record<string, string>): string[] {
  const insights: string[] = [];
  const pathInsights = resultsContent.personalizedInsights[path] as Record<string, Record<string, string>>;

  // Map question IDs to check based on path
  const questionsToCheck = {
    A: ["Q1A", "Q2A", "Q3A"],
    B: ["Q1B", "Q2B", "Q3B"],
    C: ["Q1C", "Q2C", "Q3C"],
  };

  // Get insights based on answers
  for (const questionId of questionsToCheck[path]) {
    const answer = answers[questionId];
    if (answer && pathInsights[questionId] && pathInsights[questionId][answer]) {
      insights.push(pathInsights[questionId][answer]);
    }
  }

  // Ensure we have at least 3 insights
  while (insights.length < 3) {
    const defaultInsights = pathResults[path].insights;
    const remaining = defaultInsights.filter((i) => !insights.includes(i));
    if (remaining.length > 0) {
      insights.push(remaining[0]);
    } else {
      break;
    }
  }

  return insights.slice(0, 4);
}

// Generate radar chart data based on answers
function generateCapabilityProfile(path: Path, answers: Record<string, string>) {
  const profiles = {
    A: {
      // Logiaweb (Beginners) - based on stage and learning style
      Technical: answers["Q1A"] === "just_starting" ? 40 : answers["Q1A"] === "some_traction" ? 60 : 70,
      Motivation: answers["Q2A"] === "not_confident" ? 50 : answers["Q2A"] === "overwhelmed" ? 55 : 65,
      Time: 60,
      Experience: answers["Q1A"] === "just_starting" ? 30 : answers["Q1A"] === "some_traction" ? 50 : 65,
      Focus: answers["Q2A"] === "no_focus" ? 40 : answers["Q3A"] === "scattered" ? 45 : 70,
      Tools: answers["Q3A"] === "scattered" ? 40 : answers["Q3A"] === "consume_no_apply" ? 55 : 65,
    },
    B: {
      // Klime Studio (Founders) - based on brand stage
      Technical: 65,
      Motivation: 75,
      Time: 60,
      Experience: answers["Q1B"] === "idea_only" ? 40 : answers["Q1B"] === "amateur_brand" ? 60 : 75,
      Focus: answers["Q2B"] === "dont_know_start" ? 45 : 70,
      Tools: answers["Q1B"] === "idea_only" ? 35 : answers["Q1B"] === "amateur_brand" ? 55 : 70,
    },
    C: {
      // Limora (Designers) - based on asset workflow
      Technical: 75,
      Motivation: 70,
      Time: answers["Q1C"] === "hunting_assets" ? 50 : answers["Q2C"] === "platform_hopping" ? 55 : 65,
      Experience: 75,
      Focus: answers["Q1C"] === "inconsistent_visuals" ? 55 : 70,
      Tools: answers["Q1C"] === "ai_unusable" ? 50 : answers["Q2C"] === "tweaking_ai" ? 55 : 70,
    },
  };

  const profile = profiles[path];

  return [
    { subject: "Technical", value: profile.Technical, fullMark: 100 },
    { subject: "Motivation", value: profile.Motivation, fullMark: 100 },
    { subject: "Time", value: profile.Time, fullMark: 100 },
    { subject: "Experience", value: profile.Experience, fullMark: 100 },
    { subject: "Focus", value: profile.Focus, fullMark: 100 },
    { subject: "Tools", value: profile.Tools, fullMark: 100 },
  ];
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [subscribeError, setSubscribeError] = useState("");
  const [isSubscribingOnly, setIsSubscribingOnly] = useState(false);

  const id = searchParams.get("id") || "";

  // Decode all quiz data from single ID parameter
  const { name: firstName, path, email: passedEmail, answers } = decodeQuizData(id);

  // Validate path is valid
  const validPath = (["A", "B", "C"] as const).includes(path as "A" | "B" | "C") ? path : "A";

  // Use passed email or input email
  const email = passedEmail || inputEmail;

  const result = pathResults[validPath];
  const personalizedInsights = getPersonalizedInsights(validPath, answers);
  const capabilityData = generateCapabilityProfile(validPath, answers);

  // Get path-specific wizard image
  const pathImages = {
    A: "/emerging_wizard,.png",
    B: "/scaling_wizard.png",
    C: "/creator_wizard.png",
  };
  const wizardImage = pathImages[validPath];

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputEmail(value);
    setEmailError("");
    setSubscribeError("");
  };

  const handleGetLearningPath = async () => {
    // Validate email if not passed via URL
    if (!passedEmail && inputEmail) {
      if (!isValidEmail(inputEmail)) {
        setEmailError(commonContent.errors.invalidEmail);
        return;
      }
    }

    setIsLoading(true);
    setSubscribeError("");

    // Subscribe to Beehiiv if we have an email
    if (email) {
      try {
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            firstName,
            path: result.path,
            result: result.subtitle,
            bottleneckTitle: result.title,
            answers,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          console.error("Subscription failed:", data);
          setSubscribeError(data.error || commonContent.errors.subscribeFailed);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Subscription error:", error);
        setSubscribeError(commonContent.errors.genericError);
        setIsLoading(false);
        return;
      }
    }

    // Redirect to learning path page (reuse same id)
    router.push(`/learning-path?id=${id}`);
    // Note: Don't setIsLoading(false) here as we're navigating away
  };

  const handleNewsletterOnly = async () => {
    // Validate email if not passed via URL
    if (!passedEmail && inputEmail) {
      if (!isValidEmail(inputEmail)) {
        setEmailError(commonContent.errors.invalidEmail);
        return;
      }
    }

    if (!email) {
      setEmailError(commonContent.errors.enterEmail);
      return;
    }

    setIsSubscribingOnly(true);
    setSubscribeError("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          path: result.path,
          result: result.subtitle,
          bottleneckTitle: result.title,
          answers,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error("Subscription failed:", data);
        setSubscribeError(data.error || commonContent.errors.subscribeFailed);
        setIsSubscribingOnly(false);
        return;
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setSubscribeError(commonContent.errors.genericError);
      setIsSubscribingOnly(false);
      return;
    }

    // Redirect to external URL
    window.location.href = "https://akarisocial.com/welcome";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-xl">
        <Card className="border-[3px] border-black rounded-[25px] shadow-none bg-white overflow-hidden py-0">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="bg-linear-to-br from-gray-50 to-white p-5 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                {/* Wizard Character - show at top on mobile */}
                <div className="shrink-0 flex justify-center md:hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={wizardImage}
                    alt="Wizard character"
                    width={100}
                    height={100}
                    className="object-contain animate-scale-in"
                  />
                </div>

                <div className="space-y-4 flex-1">
                  <div className="inline-block">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm font-semibold rounded-full">
                      {resultsContent.labels.bottleneckType}
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold leading-tight animate-fade-in-up">
                    {result.title}
                  </h1>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs md:text-sm font-medium border-2 border-primary text-primary rounded-full opacity-0 animate-fade-in"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: "forwards",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {result.description}
                  </p>
                </div>

                {/* Wizard Character - show at side on desktop */}
                <div className="hidden md:flex shrink-0 justify-end">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={wizardImage}
                    alt="Wizard character"
                    width={140}
                    height={140}
                    className="object-contain animate-scale-in"
                  />
                </div>
              </div>
            </div>

            {/* Capability Profile Chart */}
            <div className="p-5 md:p-8 border-t-[3px] border-black bg-gray-50">
              <h3 className="font-bold text-base md:text-lg mb-6 text-center">
                {resultsContent.labels.capabilityProfile}
              </h3>
              <div className="w-full h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={capabilityData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar
                      name="Capability"
                      dataKey="value"
                      stroke="#38b6ff"
                      fill="#38b6ff"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Personalized Insights Section */}
            <div className="p-5 md:p-8 border-t-[3px] border-black">
              <h3 className="font-bold text-base md:text-lg mb-4">
                {resultsContent.labels.basedOnAnswers.replace("{name}", firstName)}
              </h3>
              <div className="space-y-3">
                {personalizedInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 md:p-4 bg-gray-50 rounded-xl opacity-0 animate-fade-in-up"
                    style={{
                      animationDelay: `${0.2 + index * 0.1}s`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ArrowIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm md:text-base leading-relaxed">
                      {insight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="p-5 md:p-8 border-t-[3px] border-black bg-primary text-white">
              <div className="text-center space-y-4">
                <p className="text-lg md:text-xl font-bold">
                  {resultsContent.labels.ctaHeading.replace("{name}", firstName)}
                </p>
                <p className="text-sm md:text-base text-white/80">
                  {resultsContent.labels.ctaSubheading}
                </p>
                {!passedEmail && (
                  <div className="max-w-sm mx-auto space-y-2">
                    <Input
                      type="email"
                      placeholder={resultsContent.labels.emailPlaceholder}
                      value={inputEmail}
                      onChange={handleEmailChange}
                      className={`h-12 bg-white text-black border-[3px] rounded-xl placeholder:text-gray-400 focus-visible:ring-0 ${
                        emailError ? "border-red-500" : "border-black focus-visible:border-black"
                      }`}
                    />
                    {emailError && (
                      <p className="text-red-200 text-sm">{emailError}</p>
                    )}
                  </div>
                )}
                {subscribeError && (
                  <p className="text-red-200 text-sm">{subscribeError}</p>
                )}
                <Button
                  onClick={handleGetLearningPath}
                  disabled={isLoading || isSubscribingOnly || !email}
                  className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-12 text-base md:text-lg font-bold bg-white text-primary hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? resultsContent.labels.loadingButton : resultsContent.labels.getLearningPathButton}
                </Button>
                <button
                  onClick={handleNewsletterOnly}
                  disabled={isLoading || isSubscribingOnly}
                  className="block mx-auto mt-4 text-sm text-white/70 hover:text-white underline underline-offset-2 transition-colors disabled:opacity-50"
                >
                  {isSubscribingOnly ? resultsContent.labels.subscribingButton : resultsContent.labels.newsletterLink}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-pulse text-muted-foreground">
            {resultsContent.labels.suspenseFallback}
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
