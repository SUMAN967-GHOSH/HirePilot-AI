import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
          <div className="relative w-8 h-8">
            <Image 
              src="/logo.png" 
              alt="HirePilot AI Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">HirePilot AI</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/upload" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            New Analysis
          </Link>
        </nav>
      </div>
    </header>
  );
}
