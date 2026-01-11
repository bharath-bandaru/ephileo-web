'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import Header from '@/components/ui/Header';
import ProjectCard from '@/components/ui/ProjectCard';
import { projects } from '@/lib/projects';

// Dynamic import for 3D scene to avoid SSR issues
const PinScene = dynamic(() => import('@/components/3d/PinScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const sceneOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    // Track scroll progress for parallax
    const unsubscribe = scrollYProgress.on('change', (value) => {
      setScrollProgress(Math.min(value * 5, 1)); // Scale for hero section only
    });

    // GSAP animations for sections with improved performance
    const sections = gsap.utils.toArray('.animate-section');
    sections.forEach((section) => {
      gsap.fromTo(
        section as Element,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section as Element,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    return () => {
      unsubscribe();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [scrollYProgress]);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Store form reference before async operations
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('API Response:', { status: response.status, ok: response.ok, data: responseData });

      if (response.ok) {
        setSubmitStatus('success');
        form.reset();
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        console.error('API Error:', responseData);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="bg-[#05080a] min-h-screen">
      <Header />

      {/* Hero Section with 3D Pins */}
      <motion.section
        ref={heroRef}
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* 3D Canvas */}
        <motion.div className="absolute inset-0 z-0" style={{ opacity: sceneOpacity }}>
          <PinScene scrollProgress={scrollProgress} />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 pointer-events-none absolute top-[15%]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-4 text-white font-[family-name:var(--font-cookie)]"
          >
            ephileo
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-zinc-300 mb-8"
          >
            build products people love.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-sm text-zinc-500 max-w-md mx-auto"
          >
            Click on a building to explore our projects. <br />Drag to look around.
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Projects Section */}
      <section id="projects" className="relative z-10 py-32 px-6 bg-gradient-to-b from-[#05080a] via-[#081219] to-[#05080a]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 rounded-full bg-[#0fb0c8]/10 border border-[#0fb0c8]/25 text-[#0fb0c8] text-sm font-medium">
                Featured Work
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-[#f2b134] via-[#0fb0c8] to-[#1fc77a] bg-clip-text text-transparent">
              Our Projects
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Beautifully designed applications that bring joy to people&apos;s lives
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-32 px-6 overflow-hidden bg-gradient-to-b from-[#05080a] via-[#081219] to-[#05080a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0fb0c8]/14 via-transparent to-transparent" />

        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4"
            >
              <span className="px-4 py-2 rounded-full bg-[#1fc77a]/15 border border-[#1fc77a]/25 text-[#1fc77a] text-sm font-medium">
                Who We Are
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="text-white">Crafting Digital </span>
              <span className="bg-gradient-to-r from-[#f2b134] via-[#0fb0c8] to-[#1fc77a] bg-clip-text text-transparent">Experiences</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-12 max-w-3xl mx-auto">
              At Ephileo, we believe that great products come from the perfect blend of
              innovative technology and thoughtful design. We&apos;re a small team with big dreams.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-[#f2b134] via-[#0fb0c8] to-[#1fc77a] bg-clip-text text-transparent mb-2">
                  3
                </div>
                <div className="text-zinc-400">Products Built</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-[#f2b134] via-[#0fb0c8] to-[#1fc77a] bg-clip-text text-transparent mb-2">
                  17K+
                </div>
                <div className="text-zinc-400">Happy Users</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-[#f2b134] via-[#0fb0c8] to-[#1fc77a] bg-clip-text text-transparent mb-2">
                  100%
                </div>
                <div className="text-zinc-400">Passion</div>
              </motion.div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0fb0c8]/15 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#0fb0c8]"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Design First</h3>
                <p className="text-zinc-400 text-sm">
                  Beautiful, intuitive interfaces that users love to interact with.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f2b134]/15 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#f2b134]"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Quality Code</h3>
                <p className="text-zinc-400 text-sm">
                  Clean, maintainable code that scales and performs flawlessly.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0fb0c8]/15 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#0fb0c8]"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">User Focused</h3>
                <p className="text-zinc-400 text-sm">
                  Every decision centers around creating the best user experience.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-32 px-6 overflow-hidden bg-gradient-to-b from-[#05080a] via-[#081219] to-[#05080a]">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0fb0c8]/12 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#f2b134]/12 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#1fc77a]/12 rounded-full blur-3xl" />

        <div className="max-w-2xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4 w-full text-center"
            >
              <span className="px-4 py-2 rounded-full bg-[#0fb0c8]/12 border border-[#0fb0c8]/25 text-[#0fb0c8] text-sm font-medium">
                Let&apos;s Connect
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-[#f2b134] via-[#0fb0c8] to-[#1fc77a] bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-zinc-400 text-center mb-12">
              Have a question or want to work together? Send us a message.
            </p>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/10">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0fb0c8]/50 focus:border-[#0fb0c8]/50 transition-all hover:border-white/20"
                    placeholder="Your name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0fb0c8]/50 focus:border-[#0fb0c8]/50 transition-all hover:border-white/20"
                    placeholder="your@email.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0fb0c8]/50 focus:border-[#0fb0c8]/50 transition-all resize-none hover:border-white/20"
                    placeholder="Your message..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-[#1fc77a]/10 border border-[#1fc77a]/30 text-[#1fc77a] text-sm flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Message sent successfully! We&apos;ll get back to you soon.</span>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Failed to send message. Please try again.</span>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-xl bg-[#0fb0c8] text-white font-semibold hover:bg-[#0da1b5] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0fb0c8]/30"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 bg-gradient-to-b from-[#05080a] via-[#081219] to-[#05080a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f2b134] to-[#0fb0c8] flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <p className="text-zinc-400 text-sm">
              &copy; {new Date().getFullYear()} Ephileo. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-500 hover:text-[#0fb0c8] transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-zinc-500 hover:text-[#0fb0c8] transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
