'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { RETURN_KEY } from './PostLink';

// Same floating Back pill and fade-out as the project pages. Returns to the
// page the post was opened from (home or the blog index), defaulting to /blog
// for visitors who landed on the post directly.
export default function BackButton({ fadeTarget }: { fadeTarget: string }) {
  const router = useRouter();

  const handleBack = () => {
    let target = '/blog';
    try {
      target = sessionStorage.getItem(RETURN_KEY) || '/blog';
      sessionStorage.removeItem(RETURN_KEY);
    } catch {}

    const el = document.getElementById(fadeTarget);
    if (!el) return router.push(target);
    gsap.to(el, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => router.push(target),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-6 left-6 z-50"
    >
      <motion.button
        onClick={handleBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </motion.button>
    </motion.div>
  );
}
