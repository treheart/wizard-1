"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon } from "@/components/ui/icons";
import learningPathContent from "@/content/learning-path.json";
import { decodeQuizData } from "@/lib/answer-encoding";
import { pathResults } from "@/lib/quiz-data";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const loadingMessages = learningPathContent.loading.messages;

const COURSE_URLS = {
  A: "https://logiaweb.net/#pricing",
  B: "https://cal.com/adrien-ninet/founder-qualification-call",
  C: "https://limora.ai/",
};


function LoadingScreen({ progress, message }: { progress: number; message: string }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="relative w-48 h-48 mb-8 rounded-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/loading_0.mp4" type="video/mp4" />
        </video>
      </div>
      <p className="text-lg md:text-xl text-gray-700 mb-8 text-center animate-pulse">
        {message}
      </p>
      <div className="w-full max-w-md px-4">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%`, backgroundColor: '#38b6ff' }}
          />
        </div>
        <p className="text-center text-gray-500 mt-3 font-medium">{progress}%</p>
      </div>
    </div>
  );
}

// Star icon for testimonials
function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.248l2.898 5.873 6.482.943-4.69 4.57 1.107 6.453L12 17.77l-5.797 3.017 1.107-6.453-4.69-4.57 6.482-.943L12 2.248z" />
    </svg>
  );
}

// Focus icon
function FocusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// Goal icon
function GoalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

// Clock icon
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    // Initialize timer on client side only
    const STORAGE_KEY = '_lp_ts';
    const DURATION_KEY = '_lp_td';

    const getRandomDuration = () => {
      // Start at 4 minutes 59 seconds (299 seconds)
      return 299;
    };

    // Get or set start time and duration
    let startTime = sessionStorage.getItem(STORAGE_KEY);
    let duration = sessionStorage.getItem(DURATION_KEY);

    if (!startTime || !duration) {
      startTime = Date.now().toString();
      duration = getRandomDuration().toString();
      sessionStorage.setItem(STORAGE_KEY, startTime);
      sessionStorage.setItem(DURATION_KEY, duration);
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - parseInt(startTime!)) / 1000);
      const remaining = Math.max(0, parseInt(duration!) - elapsed);

      // If timer expired, reset with new random duration
      if (remaining === 0) {
        const newStartTime = Date.now().toString();
        const newDuration = getRandomDuration().toString();
        sessionStorage.setItem(STORAGE_KEY, newStartTime);
        sessionStorage.setItem(DURATION_KEY, newDuration);
        startTime = newStartTime;
        duration = newDuration;
        setTimeLeft(parseInt(newDuration));
      } else {
        setTimeLeft(remaining);
      }
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft === null) {
    return <>15:00</>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return <>{formattedTime}</>;
}

function LearningPathContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment + Math.random() * 0.5;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 300);
          return 100;
        }
        return Math.min(next, 100);
      });
    }, interval);

    const messageTimer = setInterval(() => {
      setProgress((currentProgress) => {
        const newIndex = Math.min(
          Math.floor(currentProgress / 20),
          loadingMessages.length - 1
        );
        setMessageIndex(newIndex);
        return currentProgress;
      });
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen progress={Math.round(progress)} message={loadingMessages[messageIndex]} />;
  }

  const { name, path } = decodeQuizData(id);
  const result = pathResults[path];

  // Get content from JSON and replace {name} placeholder
  const pathData = learningPathContent.paths[path];
  const content = {
    ...pathData,
    description: pathData.description.replace("{name}", name),
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Countdown Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="text-black py-5 md:py-6 px-6" style={{ backgroundColor: '#38b6ff' }}>
          <div className="relative flex items-center justify-center max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-6 h-6 stroke-[2.5]" />
              <span className="text-base md:text-lg font-bold">{learningPathContent.timer.label}</span>
              <span className="text-xl md:text-2xl font-black"><CountdownTimer /></span>
            </div>
            <Button
              onClick={() => window.open(COURSE_URLS[(decodeQuizData(searchParams.get("id") || "").path as keyof typeof COURSE_URLS) || "A"], '_blank')}
              className="absolute right-0 bg-black hover:bg-gray-900 text-white font-bold h-10 px-6 text-sm rounded-lg"
            >
              {learningPathContent.timer.button}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-12 md:py-16" style={{ paddingTop: '100px' }}>
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="flex justify-center mb-4">
            <Image
              src={content.image}
              alt="Wizard"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {content.headline} <span className="inline-block">🎉</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        {/* Focus & Goal Cards */}
        <div className="grid grid-cols-2 w-full gap-3 md:gap-4 pt-6 lg:pt-8">
          <div
            className="bg-gray-50 rounded-xl p-4 border border-gray-200 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <FocusIcon className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{learningPathContent.labels.yourFocus}</span>
            </div>
            <p className="font-semibold">{content.focus}</p>
          </div>
          <div
            className="bg-gray-50 rounded-xl p-4 border border-gray-200 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <GoalIcon className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{learningPathContent.labels.yourGoal}</span>
            </div>
            <p className="font-semibold">{content.goal}</p>
          </div>
        </div>

        {/* Main Offer Card */}
        <Card
          className="w-full mt-10 border-2 border-black rounded-[25px] shadow-none bg-white overflow-hidden opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          <CardContent className="p-0">
            {/* Offer Header */}
            <div className="text-center p-6 md:p-8 space-y-3">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold uppercase tracking-wide">
                {learningPathContent.labels.newOffer}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">{content.offerTitle}</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                {content.offerDescription}
              </p>
              <div className="md:hidden pt-4">
                <Button 
                  onClick={() => window.open(COURSE_URLS[path as keyof typeof COURSE_URLS], '_blank')}
                  className="w-full h-12 text-white hover:opacity-90 font-bold" 
                  style={{ backgroundColor: '#38b6ff' }}
                >
                  {learningPathContent.timer.button}
                </Button>
              </div>
            </div>

            {/* What's Included */}
            <div className="p-6 md:p-8 border-t-2 border-black">
              <h3 className="text-xl font-bold mb-4">{learningPathContent.labels.whatsIncluded}</h3>
              <div className="space-y-3">
                {content.included.map((item, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                      index === 0
                        ? "bg-primary/5 border-2 border-primary"
                        : "bg-white border-2 border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        index === 0 ? "bg-primary" : "bg-gray-300"
                      }`}
                    >
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What You'll Achieve */}
            <div className="p-6 md:p-8 border-t-2 border-black bg-gray-50">
              <h3 className="text-xl font-bold text-center mb-6">{learningPathContent.labels.whatYoullAchieve}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {content.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#38b6ff' }}>
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-medium">{achievement}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottleneck Reminder */}
        <div
          className="w-full mt-10 text-center opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
        >
          <p className="text-sm text-muted-foreground mb-2">{learningPathContent.labels.basedOnQuizResults}</p>
          <div className="inline-block px-4 py-2 bg-gray-100 rounded-full">
            <span className="font-semibold">{learningPathContent.labels.yourBottleneck} </span>
            <span className="text-primary">{result.title}</span>
          </div>
        </div>

        {/* Pricing Section */}
        <div
          id="pricing-section"
          className="w-full mt-14 space-y-4 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center">{learningPathContent.pricing.getYourTitle.replace("{offerTitle}", content.offerTitle)}</h3>
          <p className="text-base md:text-lg text-muted-foreground text-center">
            {content.pricing?.subtitle || learningPathContent.pricing.subtitle}
          </p>

          <Card className="w-full border-[3px] border-black rounded-[25px] shadow-none bg-white overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="max-w-lg mx-auto space-y-6">
                <div className="text-center py-4">
                  <span className="text-6xl md:text-7xl font-bold">{content.pricing?.amount || learningPathContent.pricing.amount}</span>
                </div>

                <ul className="space-y-4">
                  {content.included.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{item.title} - {item.description}</span>
                    </li>
                  ))}
                  {learningPathContent.pricing.bonuses.map((bonus, index) => (
                    <li key={`bonus-${index}`} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{bonus}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => window.open(COURSE_URLS[path as keyof typeof COURSE_URLS], '_blank')}
                  className="w-full h-14 text-lg text-white hover:opacity-90 font-bold"
                  style={{ backgroundColor: '#38b6ff' }}
                >
                  {content.pricing?.buttonText || learningPathContent.timer.button}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {learningPathContent.pricing.notReadyText}{" "}
                  <a href="#" className="underline hover:text-foreground">
                    {learningPathContent.pricing.notReadyLink}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div
          className="w-full mt-14 space-y-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            {learningPathContent.labels.testimonialsHeading}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {content.testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-2 border-gray-200 rounded-xl shadow-none bg-white"
              >
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex gap-0.5 text-yellow-500 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic leading-relaxed grow">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <Card
          className="w-full mt-14 border-[3px] rounded-[25px] shadow-none text-white overflow-hidden opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.6s", animationFillMode: "forwards", backgroundColor: '#38b6ff', borderColor: '#38b6ff' }}
        >
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <p className="text-2xl md:text-3xl font-bold">
              {learningPathContent.finalCta.heading.replace("{name}", name)}
            </p>
            <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto">
              {learningPathContent.finalCta.subheading}
            </p>
            <div className="flex flex-col items-center gap-4">
              <Button
                  onClick={() => window.open(COURSE_URLS[path as keyof typeof COURSE_URLS], '_blank')}
                  variant="outline"
                  className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-white border-white hover:bg-gray-100"
                  style={{ color: '#38b6ff' }}
                >
                  {learningPathContent.finalCta.button}
                </Button>
              <a href="#" className="text-sm text-white/60 hover:text-white underline">
                {learningPathContent.finalCta.notReadyLink}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p
          className="text-xs md:text-sm text-muted-foreground text-center mt-8 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
        >
          {learningPathContent.labels.footer}
        </p>
      </div>
    </div>
  );
}

export default function LearningPathPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-pulse text-muted-foreground">{learningPathContent.loading.suspenseFallback}</div>
        </div>
      }
    >
      <LearningPathContent />
    </Suspense>
  );
}
