'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProject } from '@/lib/projects';

export default function TermsPage() {
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
            Terms & Conditions
          </h1>

          <p className="text-zinc-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="prose prose-invert prose-zinc max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-zinc-400 leading-relaxed">
                By accessing or using {project.name} (&quot;the Application&quot;), you agree to be bound by these
                Terms and Conditions. If you do not agree to these terms, please do not use the Application.
                These terms apply to all users, including visitors, registered users, and contributors.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Ephileo grants you a limited, non-exclusive, non-transferable license to use {project.name}
                for personal, non-commercial purposes subject to the following conditions:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>You may not copy, modify, or distribute the Application without prior written consent</li>
                <li>You may not reverse engineer, decompile, or disassemble the Application</li>
                <li>You may not use the Application for any illegal or unauthorized purpose</li>
                <li>You may not remove any proprietary notices or labels on the Application</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <p className="text-zinc-400 leading-relaxed">
                If {project.name} requires you to create an account, you are responsible for maintaining the
                confidentiality of your account credentials and for all activities that occur under your account.
                You agree to notify us immediately of any unauthorized use of your account. We reserve the right
                to terminate accounts that violate these terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
              <p className="text-zinc-400 leading-relaxed">
                All content, features, and functionality of {project.name}, including but not limited to text,
                graphics, logos, icons, images, audio clips, and software, are the exclusive property of Ephileo
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">5. Disclaimer of Warranties</h2>
              <p className="text-zinc-400 leading-relaxed">
                {project.name} is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind,
                either express or implied. Ephileo does not warrant that the Application will be uninterrupted,
                error-free, or free of viruses or other harmful components. Your use of the Application is at
                your sole risk.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
              <p className="text-zinc-400 leading-relaxed">
                To the fullest extent permitted by applicable law, Ephileo shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
                whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible
                losses resulting from your use of {project.name}.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
              <p className="text-zinc-400 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. We will notify users of
                any material changes by posting the new terms on this page. Your continued use of {project.name}
                after such modifications constitutes your acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">8. Contact Information</h2>
              <p className="text-zinc-400 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at{' '}
                <a href="mailto:legal@ephileo.com" className="text-white hover:underline">
                  legal@ephileo.com
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
