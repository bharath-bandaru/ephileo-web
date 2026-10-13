import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Block } from '@/lib/blog';

// Tiny inline formatter: **bold** and [label](href). Keeps post content as
// plain strings in lib/blog.ts while still rendering real <a>/<strong> tags
// that crawlers can follow.
const INLINE = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(
        <strong key={m.index} className="text-white font-semibold">
          {m[1]}
        </strong>
      );
    } else {
      const href = m[3];
      const web = href.startsWith('http');
      const external = web || href.startsWith('mailto:');
      out.push(
        external ? (
          <a
            key={m.index}
            href={href}
            target={web ? '_blank' : undefined}
            rel={web ? 'noopener noreferrer' : undefined}
            className="text-[#34D399] underline decoration-[#34D399]/40 underline-offset-4 hover:decoration-[#34D399]"
          >
            {m[2]}
          </a>
        ) : (
          <Link
            key={m.index}
            href={href}
            className="text-[#34D399] underline decoration-[#34D399]/40 underline-offset-4 hover:decoration-[#34D399]"
          >
            {m[2]}
          </Link>
        )
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

export default function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-zinc-300 text-[17px] leading-[1.8]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2
                key={i}
                id={block.id}
                className="scroll-mt-24 text-2xl md:text-3xl font-bold text-white mt-14 mb-5 leading-tight"
              >
                {block.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={i} className="text-xl font-semibold text-white mt-8 mb-3">
                {block.text}
              </h3>
            );
          case 'p':
            return (
              <p key={i} className="mb-5">
                <Inline text={block.text} />
              </p>
            );
          case 'ul':
          case 'ol': {
            const List = block.type;
            return (
              <List
                key={i}
                className={`mb-6 space-y-2 pl-6 marker:text-[#10B981] ${
                  block.type === 'ul' ? 'list-disc' : 'list-decimal'
                }`}
              >
                {block.items.map((item) => (
                  <li key={item} className="pl-1">
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case 'table':
            return (
              <div key={i} className="mb-8 overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="w-full min-w-[640px] text-left text-[15px]">
                  {block.caption && (
                    <caption className="px-4 pt-4 text-left text-sm text-zinc-500">
                      {block.caption}
                    </caption>
                  )}
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {block.head.map((h) => (
                        <th key={h} scope="col" className="px-4 py-3 font-semibold text-white">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => (
                      <tr key={row[0]} className="border-b border-zinc-800/60 last:border-0">
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className={`px-4 py-3 align-top ${c === 0 ? 'text-white font-medium' : 'text-zinc-400'}`}
                          >
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'callout':
            return (
              <aside
                key={i}
                className="mb-8 rounded-2xl border border-[#10B981]/25 bg-[#10B981]/[0.07] p-5 md:p-6"
              >
                {block.title && (
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#34D399]">
                    {block.title}
                  </p>
                )}
                <p className="text-zinc-200">
                  <Inline text={block.text} />
                </p>
              </aside>
            );
          case 'cards':
            return (
              <div key={i} className="mb-10 grid gap-4 sm:grid-cols-3">
                {block.items.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-[#10B981]/25 bg-gradient-to-b from-[#10B981]/[0.12] to-transparent p-5"
                  >
                    <div
                      className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#10B981]/20 text-2xl"
                      aria-hidden="true"
                    >
                      {card.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">{card.title}</h3>
                    <p className="text-[15px] leading-relaxed text-zinc-400">
                      <Inline text={card.text} />
                    </p>
                  </div>
                ))}
              </div>
            );
          case 'quote':
            return (
              <blockquote
                key={i}
                className="mb-8 border-l-2 border-[#10B981] pl-5 text-xl leading-relaxed text-white"
              >
                <Inline text={block.text} />
              </blockquote>
            );
        }
      })}
    </div>
  );
}
