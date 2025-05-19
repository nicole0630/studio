import Link from 'next/link';
import { Music4 } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="bg-primary/10  py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
          <Music4 size={36} strokeWidth={2.5} />
          <h1 className="text-3xl font-bold tracking-tight">
            Nursery Rhyme Swinger
          </h1>
        </Link>
      </div>
    </header>
  );
}
