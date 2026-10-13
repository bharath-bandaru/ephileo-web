'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export const RETURN_KEY = 'blogReturnTo';

// Opens a blog post the same way ProjectCard opens an app page: remembers
// where we came from (and the home page's scroll position) so the post's
// Back button can return there.
export default function PostLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    sessionStorage.setItem(RETURN_KEY, pathname);
    if (pathname === '/') {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    }
    router.push(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
