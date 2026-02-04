import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
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
            <h1 className="text-2xl font-bold">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          <Link href="/">
            <Button className="h-12 px-8 text-base font-bold bg-black text-white hover:bg-black/90">
              Back to Quiz
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
