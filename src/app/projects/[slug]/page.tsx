'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { getProject, projects } from '@/lib/projects';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const project = getProject(params.slug as string);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      );
    }
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Project not found</h1>
          <Link
            href="/"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-6 left-6 z-50"
      >
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium hover:bg-white/20 transition-colors"
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
        </Link>
      </motion.div>

      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <Image
            src={project.banner}
            alt={project.name}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent, ${project.color}30, black)`,
            }}
          />
        </motion.div>

        {/* Project Logo and Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-6xl mx-auto flex items-end gap-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-2xl bg-black p-3 md:p-4"
            >
              <Image
                src={project.logo}
                alt={project.name}
                width={128}
                height={128}
                className="w-full h-full object-contain"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                {project.name}
              </h1>
              <p className="text-xl text-zinc-300">{project.tagline}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-8 md:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="md:col-span-2"
            >
              <h2 className="text-2xl font-bold text-white mb-6">About</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                {project.description}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-zinc-900 rounded-2xl p-6">
                  <p className="text-zinc-500 text-sm mb-1">Type</p>
                  <p className="text-white font-semibold capitalize">
                    {project.type}
                  </p>
                </div>
                <div className="bg-zinc-900 rounded-2xl p-6">
                  <p className="text-zinc-500 text-sm mb-1">Status</p>
                  <p
                    className="font-semibold"
                    style={{ color: project.accentColor }}
                  >
                    {project.status === 'coming-soon' ? 'Coming Soon' : 'Released'}
                  </p>
                </div>
              </div>

              {/* Features Section */}
              <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
              <div className="space-y-4 mb-12">
                {project.type === 'game' ? (
                  <>
                    <FeatureItem
                      color={project.color}
                      title="Engaging Gameplay"
                      description="Hours of entertainment with carefully crafted mechanics"
                    />
                    <FeatureItem
                      color={project.color}
                      title="Beautiful Design"
                      description="Stunning visuals that delight the senses"
                    />
                    <FeatureItem
                      color={project.color}
                      title="Play Anywhere"
                      description="Available on multiple platforms for gaming on the go"
                    />
                  </>
                ) : (
                  <>
                    <FeatureItem
                      color={project.color}
                      title="Intuitive Interface"
                      description="Designed for ease of use without sacrificing power"
                    />
                    <FeatureItem
                      color={project.color}
                      title="Smart Features"
                      description="Intelligent tools that adapt to your needs"
                    />
                    <FeatureItem
                      color={project.color}
                      title="Privacy First"
                      description="Your data stays yours, always secure"
                    />
                  </>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-6"
            >
              {/* Download buttons */}
              {project.status === 'released' && project.links && (
                <div className="bg-zinc-900 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Get the App
                  </h3>
                  <div className="flex flex-col gap-4">
                    {project.links.appStore && (
                      <Link href={project.links.appStore} target="_blank" rel="noopener noreferrer">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-black font-medium cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                          </svg>
                          App Store
                        </motion.button>
                      </Link>
                    )}
                    {project.links.playStore && (
                      <Link href={project.links.playStore} target="_blank" rel="noopener noreferrer">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 text-white font-medium cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.64.71.64 1.19s-.09.82-.64 1.19l-2.11 1.21-2.5-2.5 2.5-2.5 2.11 1.21v.2zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
                          </svg>
                          Google Play
                        </motion.button>
                      </Link>
                    )}
                    {project.links.website && (
                      <Link href={project.links.website} target="_blank" rel="noopener noreferrer">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                          style={{ backgroundColor: project.color + '30', color: project.accentColor }}
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
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                          Play Online
                        </motion.button>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {project.status === 'coming-soon' && (
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: project.color + '20' }}
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    We&apos;re putting the finishing touches on {project.name}. Stay
                    tuned for updates!
                  </p>
                </div>
              )}

              {/* Legal */}
              <div className="bg-zinc-900 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
                <div className="space-y-3">
                  <Link
                    href={`/projects/${project.id}/terms`}
                    className="flex items-center justify-between text-zinc-400 hover:text-white transition-colors"
                  >
                    <span>Terms & Conditions</span>
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
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href={`/projects/${project.id}/privacy`}
                    className="flex items-center justify-between text-zinc-400 hover:text-white transition-colors"
                  >
                    <span>Privacy Policy</span>
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
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Other Projects */}
      <div className="px-8 md:px-16 py-16 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Other Projects</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {projects
              .filter((p) => p.id !== project.id)
              .map((otherProject) => (
                <Link key={otherProject.id} href={`/projects/${otherProject.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-colors"
                  >
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden p-2"
                      style={{ backgroundColor: otherProject.color + '20' }}
                    >
                      <Image
                        src={otherProject.logo}
                        alt={otherProject.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">
                        {otherProject.name}
                      </h3>
                      <p className="text-zinc-500 text-sm">
                        {otherProject.tagline}
                      </p>
                    </div>
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
                      className="text-zinc-500 group-hover:text-white transition-colors"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 md:px-16 py-8 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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

function FeatureItem({
  color,
  title,
  description,
}: {
  color: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color + '30' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-zinc-500 text-sm">{description}</p>
      </div>
    </div>
  );
}
