'use client';

import { useEffect, useRef, useState } from 'react';

// Headings count as "current" once they pass this line (px from the top of
// the viewport) — just below the fixed header.
const ACTIVE_OFFSET = 140;

export default function TableOfContents({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= ACTIVE_OFFSET) current = h.id;
        else break;
      }
      // At the very bottom the last sections may never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = headings.at(-1)?.id ?? current;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  // Keep the active link visible when the list itself scrolls.
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !link) return;
    const top = link.offsetTop - nav.offsetTop;
    if (top < nav.scrollTop || top + link.offsetHeight > nav.scrollTop + nav.clientHeight) {
      nav.scrollTo({ top: top - nav.clientHeight / 2, behavior: 'smooth' });
    }
  }, [active]);

  return (
    <nav
      ref={navRef}
      aria-label="On this page"
      className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        On this page
      </p>
      <ol className="space-y-2.5 border-l border-zinc-800 text-sm">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={`-ml-px block border-l-2 pl-4 transition-colors ${
                  isActive
                    ? 'border-[#10B981] text-[#34D399] font-medium'
                    : 'border-transparent text-zinc-400 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
