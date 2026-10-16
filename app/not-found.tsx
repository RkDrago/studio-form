import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-6 font-display text-[clamp(2rem,5vw,3.6rem)] leading-tight">
        That drawing isn&apos;t in the set
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted">
        The project you were looking for has either been unpublished or never
        existed. Head back to the portfolio to browse what&apos;s live.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">
          Back to portfolio
        </Link>
        <Link href="/admin" className="btn-ghost">
          Content studio
        </Link>
      </div>
    </div>
  );
}
