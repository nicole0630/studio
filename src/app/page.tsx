import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, PlayCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
      <Image 
        src="https://placehold.co/300x200.png" 
        alt="Swinging Character Illustration"
        width={300}
        height={200}
        className="rounded-xl shadow-lg"
        data-ai-hint="happy child swing"
      />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm shadow-xl rounded-2xl clay-inset">
        <CardHeader className="items-center">
          <Smile size={64} className="text-accent animate-bounce" />
          <CardTitle className="text-4xl font-extrabold text-primary mt-4">
            Welcome to Nursery Rhyme Swinger!
          </CardTitle>
          <CardDescription className="text-lg text-foreground/80 mt-2">
            Get ready to swing to the rhythm and have some fun!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Press the keys in time with the music to make the character swing. Let's see how high you can score!
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild size="lg" className="rounded-xl text-xl px-8 py-6 clay-button hover:scale-105 transition-transform duration-200 ease-out bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/play">
              <PlayCircle size={28} className="mr-3" />
              Start Game
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
