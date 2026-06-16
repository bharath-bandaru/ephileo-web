'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Save scroll position before navigating
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    router.push(`/projects/${project.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="h-full"
    >
      <Link href={`/projects/${project.id}`} onClick={handleClick} className="block h-full">
        <motion.div
          className="group relative h-full flex flex-col overflow-hidden rounded-3xl bg-[#0a1414] cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Banner Image */}
          <div className="relative h-64 overflow-hidden">
            <Image
              src={project.banner}
              alt={project.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0a1414] via-transparent to-transparent"
            />
          </div>

          {/* Content */}
          <div className="relative flex flex-1 flex-col p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg p-2 bg-black">
                <Image
                  src={project.logo}
                  alt={`${project.name} logo`}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                <p className="text-sm text-zinc-400">{project.tagline}</p>
              </div>
              {project.status === 'coming-soon' && (
                <span
                  className="ml-auto px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: project.color + '30',
                    color: project.accentColor,
                  }}
                >
                  Coming Soon
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {project.description}
            </p>

            {/* Type badge */}
            <div className="mt-auto pt-4 flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: project.color + '20',
                  color: project.accentColor,
                }}
              >
                {project.type === 'game' ? 'Game' : 'App'}
              </span>
            </div>
          </div>

          {/* Hover glow effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${project.color}10, transparent 70%)`,
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
