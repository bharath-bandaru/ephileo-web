'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProject } from '@/lib/projects';

export default function PrivacyPage() {
  const params = useParams();
  const project = getProject(params.slug as string);

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Project not found</h1>
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/projects/${project.id}`}>
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
              Back to {project.name}
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
              backgroundColor: project.color + '20',
              color: project.accentColor,
            }}
          >
            {project.name}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Privacy Policy
          </h1>

          <p className="text-zinc-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="prose prose-invert prose-zinc max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-zinc-400 leading-relaxed">
                Ephileo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use {project.name}.
                Please read this policy carefully to understand our practices regarding your personal data.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We may collect information about you in various ways, including:
              </p>
              <h3 className="text-xl font-semibold text-white mb-2">Personal Data</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Information you voluntarily provide, such as your name, email address, and any other information
                you choose to share when creating an account or contacting us.
              </p>
              <h3 className="text-xl font-semibold text-white mb-2">Usage Data</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Information automatically collected when you use {project.name}, including device information,
                operating system, usage patterns, and interaction data to improve our services.
              </p>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics Data</h3>
              <p className="text-zinc-400 leading-relaxed">
                We may use analytics services to collect aggregated, anonymized data about app usage to help
                us understand how users interact with {project.name} and improve our services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>Provide, maintain, and improve {project.name}</li>
                <li>Personalize your experience and deliver relevant content</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage trends and preferences</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Send you updates, newsletters, and promotional materials (with your consent)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Sharing and Disclosure</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your
                information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>With service providers who assist us in operating {project.name}</li>
                <li>To comply with legal obligations or respond to lawful requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
              <p className="text-zinc-400 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data
                against unauthorized access, alteration, disclosure, or destruction. However, no method of
                transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee
                absolute security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal data, including:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>The right to access your personal data</li>
                <li>The right to correct inaccurate or incomplete data</li>
                <li>The right to delete your personal data</li>
                <li>The right to restrict or object to processing</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">7. Children&apos;s Privacy</h2>
              <p className="text-zinc-400 leading-relaxed">
                {project.name} is not intended for children under the age of 13. We do not knowingly collect
                personal information from children under 13. If we discover that we have collected personal
                information from a child under 13, we will promptly delete that information.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">8. Changes to This Policy</h2>
              <p className="text-zinc-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by
                posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you
                to review this policy periodically for any changes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
              <p className="text-zinc-400 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at{' '}
                <a href="mailto:privacy@ephileo.com" className="text-white hover:underline">
                  privacy@ephileo.com
                </a>
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
