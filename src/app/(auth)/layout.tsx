import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-6">
          <Link href="/" className="text-[14px] font-medium text-ink">
            Resume
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
