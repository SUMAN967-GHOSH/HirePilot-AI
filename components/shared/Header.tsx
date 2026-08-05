import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
          <div className="relative w-8 h-8">
            <Image 
              src="/logo.png" 
              alt="Career Copilot Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Career Copilot</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/upload" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            New Analysis
          </Link>
        </nav>
      </div>
    </header>
  );
}
