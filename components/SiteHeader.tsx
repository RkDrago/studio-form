import Link from "next/link";

const NAV = [
  { href: "/#work", label: "Work" },
  { href: "/#categories", label: "Sectors" },
  { href: "/#studio", label: "Studio" },
  { href: "/admin", label: "Studio Admin" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line/80 bg-ink/80 backdrop-blur-xl">
      <div className="shell flex h-20 items-center justify-between">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-[0.2em] text-sand">
            STUDIOFORM
          </span>
          <span className="hidden text-[10px] uppercase tracking-eyebrow text-sand-muted sm:block">
            Interior Architecture
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[12px] uppercase tracking-[0.18em] text-sand-muted transition-colors hover:text-brass"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/admin"
          className="btn-ghost !px-4 !py-2 text-[11px] md:hidden"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
