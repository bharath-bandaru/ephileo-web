'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <motion.div
            className="text-2xl font-bold text-white tracking-tight"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            ephileo
          </motion.div>
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/#projects">
            <motion.span
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Projects
            </motion.span>
          </Link>
          <Link href="/#about">
            <motion.span
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              About
            </motion.span>
          </Link>
          <Link href="/#contact">
            <motion.span
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Contact
            </motion.span>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
