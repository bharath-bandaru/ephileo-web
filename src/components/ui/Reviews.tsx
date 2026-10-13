'use client';

import { motion } from 'framer-motion';
import { CHAIN_REACTION_REVIEWS_URL, reviews, type Review } from '@/lib/reviews';

const AVATAR_COLORS = ['#f2b134', '#0fb0c8', '#1fc77a', '#FF6B35', '#8B71ED'];

function initials(name: string) {
  const letters = name.match(/\p{L}/gu);
  if (!letters) return '★';
  const words = name.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  return (words.length > 1 ? words[0][0] + words[1][0] : letters[0]).toUpperCase();
}

function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={i <= rating ? 'text-[#f2b134]' : 'text-white/15'}
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const color = avatarColor(review.name);
  return (
    <motion.figure
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="mb-6 break-inside-avoid rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm"
    >
      <Stars rating={review.rating} />
      <blockquote className="mt-4 text-zinc-200 leading-relaxed">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      {review.reply && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="mb-1 text-xs font-semibold text-[#1fc77a]">Reply from Ephileo</p>
          <p className="text-sm text-zinc-400">{review.reply.text}</p>
        </div>
      )}

      <figcaption className="mt-5 flex items-center gap-3">
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ backgroundColor: color + '26', color }}
          aria-hidden="true"
        >
          {initials(review.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-white">{review.name}</span>
          <span className="block text-xs text-zinc-500">
            {review.project} · {review.source} · <time dateTime={review.date}>{formatDate(review.date)}</time>
          </span>
        </span>
      </figcaption>
    </motion.figure>
  );
}

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="relative z-10 py-32 px-6 overflow-hidden bg-gradient-to-b from-[#05080a] via-[#081219] to-[#05080a]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f2b134]/8 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block mb-4 px-4 py-2 rounded-full bg-[#f2b134]/12 border border-[#f2b134]/25 text-[#f2b134] text-sm font-medium">
            User Reviews
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Loved by </span>
            <span className="bg-gradient-to-r from-[#f2b134] via-[#0fb0c8] to-[#1fc77a] bg-clip-text text-transparent">
              Real People
            </span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Real reviews of Chain Reaction from Google Play, in players&apos; own words.
          </p>
        </motion.div>

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {reviews.map((review, i) => (
            <ReviewCard key={`${review.name}-${review.date}`} review={review} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={CHAIN_REACTION_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Read all reviews on Google Play →
          </a>
        </div>
      </div>
    </section>
  );
}
