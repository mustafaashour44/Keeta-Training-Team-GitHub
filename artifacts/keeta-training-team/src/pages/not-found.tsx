import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-6">
      <div className="soft-card max-w-md p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"><Compass size={24} /></span>
        <p className="eyebrow mt-6">Wrong turn</p>
        <h1 className="display-font mt-1 text-3xl font-semibold">This page is not on the map.</h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">The record may have moved, or this link may be out of date.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="link-return-overview"><ArrowLeft size={16} />Return to overview</Link>
      </div>
    </div>
  );
}
