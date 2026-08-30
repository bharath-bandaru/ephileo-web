'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ChainReactionPrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/projects/chain-reaction">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Chain Reaction
            </motion.button>
          </Link>
          <Link href="/" className="text-xl font-bold text-white">
            ephileo
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: '#FF6B3520',
              color: '#FF8C61',
            }}
          >
            Chain Reaction
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Privacy Policy
          </h1>

          <p className="text-zinc-400 mb-8">Last updated: August 30, 2026</p>

          <div className="prose prose-invert prose-zinc max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-zinc-400 leading-relaxed">
                Ephileo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) built Chain Reaction to be played, not to
                collect your data. There are no accounts to create, no profiles to fill in, and the game
                never asks for your name, email address, or contact details. This policy explains the small
                amount of data the game does handle and why.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-white mb-2">Anonymous Identifier</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                When you play online, the game signs you in anonymously using Firebase Authentication. This
                creates a random identifier that is not linked to your name, email, phone number, or any
                other personal information. It exists only so the game can tell players in a room apart.
              </p>
              <h3 className="text-xl font-semibold text-white mb-2">Online Game Data</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Online rooms relay short-lived gameplay data through Firebase Realtime Database: the 4-letter
                room code, which anonymous players are seated in the room, and the moves played. This data
                exists to run the game session and is not used to identify you.
              </p>
              <h3 className="text-xl font-semibold text-white mb-2">Usage Analytics</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We use Firebase Analytics to understand how the game is used in aggregate — for example how
                many games are played or how often online rooms are created. This data is not linked to your
                identity.
              </p>
              <h3 className="text-xl font-semibold text-white mb-2">Data Stored on Your Device</h3>
              <p className="text-zinc-400 leading-relaxed">
                Your preferences — AI difficulty, haptics, animation and undo settings — are stored only on
                your device and never leave it.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Information</h2>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>Run online multiplayer rooms and keep games in sync between players</li>
                <li>Understand aggregate usage so we can improve the game</li>
                <li>Detect and fix crashes, bugs, and abuse</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">4. What We Don&apos;t Do</h2>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>We do not sell, trade, or rent any data to third parties</li>
                <li>We do not show ads or use advertising trackers</li>
                <li>We do not collect your name, email, contacts, photos, or location</li>
                <li>We do not build profiles of players</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">5. Service Providers</h2>
              <p className="text-zinc-400 leading-relaxed">
                Chain Reaction uses Google Firebase (Authentication, Realtime Database, and Analytics) to
                power online play and analytics. Firebase processes the data described above on our behalf.
                You can read about Google&apos;s practices in the{' '}
                <a
                  href="https://firebase.google.com/support/privacy"
                  className="text-white hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Firebase Privacy documentation
                </a>
                .
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">6. If You Contact Us</h2>
              <p className="text-zinc-400 leading-relaxed">
                If you reach out for support, we will receive whatever you include in your message — such as
                your name and email address — and we use it only to respond to you.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Security and Retention</h2>
              <p className="text-zinc-400 leading-relaxed">
                Data in transit is encrypted using HTTPS/TLS. Online room data is transient and is removed or
                overwritten as rooms end and new games are played. Aggregated analytics are retained per
                Firebase&apos;s standard retention settings. No method of transmission or storage is 100%
                secure, but the game is designed to hold as little data as possible in the first place.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-zinc-400 leading-relaxed">
                Chain Reaction is suitable for all ages and does not knowingly collect personal information
                from anyone, including children under 13. Online play uses only the anonymous identifier
                described above.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
              <p className="text-zinc-400 leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with
                an updated &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
              <p className="text-zinc-400 leading-relaxed">
                If you have any questions about this Privacy Policy, contact us at{' '}
                <a href="mailto:admin@phileo.us" className="text-white hover:underline">
                  admin@phileo.us
                </a>
                .
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-white">
            ephileo
          </Link>
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Ephileo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
