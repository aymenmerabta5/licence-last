import Link from "next/link"

export default function RootNotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
        404
      </span>
      <div className="space-y-3">
        <h1 className="font-serif text-3xl text-heading">Page not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page you requested could not be found.
        </p>
      </div>
      <Link
        href="/en"
        className="inline-flex h-10 items-center justify-center border border-border px-5 text-sm font-medium transition-colors hover:bg-muted"
      >
        Return home
      </Link>
    </main>
  )
}
