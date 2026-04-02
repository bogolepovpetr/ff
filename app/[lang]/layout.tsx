import type { ReactNode } from "react";
import { Suspense } from "react";
import WikiHeader from "@/components/wiki/wiki-header";
import WikiSidebar from "@/components/wiki/sidebar";

function WikiHeaderFallback() {
  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      </div>
    </header>
  );
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div className="flex min-h-full min-h-dvh flex-1 flex-col">
      <Suspense fallback={<WikiHeaderFallback />}>
        <WikiHeader lang={lang} />
      </Suspense>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-4 px-3 py-4 sm:px-4 sm:py-6 lg:gap-6">
        <main className="min-w-0 flex-1">{children}</main>

        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-4">
            <WikiSidebar />
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-muted-foreground">
          FOMO Fighters Wiki &copy; {new Date().getFullYear()} &mdash;
          Game data updates automatically from the balance server.
        </div>
      </footer>
    </div>
  );
}
