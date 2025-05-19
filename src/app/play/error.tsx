"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <h2 className="text-2xl font-semibold text-destructive mb-4">
        Oops! Something went wrong during the game.
      </h2>
      <p className="text-muted-foreground mb-6">
        We encountered an issue. Please try resetting the game or returning home.
      </p>
      <pre className="text-xs bg-muted p-2 rounded-md mb-6 max-w-md overflow-auto">
        {error.message}
      </pre>
      <div className="flex gap-4">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="destructive"
          className="rounded-lg"
        >
          Try Again
        </Button>
        <Button asChild variant="outline" className="rounded-lg">
          <a href="/">Go Home</a>
        </Button>
      </div>
    </div>
  );
}
