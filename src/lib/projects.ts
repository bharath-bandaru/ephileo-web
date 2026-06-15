export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  banner: string;
  color: string;
  accentColor: string;
  type: "game" | "app";
  status: "released" | "coming-soon";
  features?: {
    icon?: string;
    title: string;
    description: string;
  }[];
  links?: {
    appStore?: string;
    playStore?: string;
    website?: string;
  };
}

export const projects: Project[] = [
  {
    id: "roamates",
    name: "Roamates",
    tagline: "Your journey, together",
    description:
      "Split expenses, share live locations, and plan trips with your group — then take notes, schedule tasks, and chat it all out in one place. Track balances, settle up, keep your streak alive, and stay in sync. All in one app.",
    logo: "/projects/roamates/logo.png",
    banner: "/projects/roamates/banner.png",
    color: "#10B981",
    accentColor: "#34D399",
    type: "app",
    status: "released",
    features: [
      {
        icon: "💬",
        title: "Notes & Group Collab",
        description:
          "Drop it in your group, chat it out, and never go digging through 47 texts again.",
      },
      {
        icon: "✅",
        title: "Schedule Tasks",
        description:
          "Set the task, talk it out, and let it live rent-free in the app — not your brain.",
      },
      {
        icon: "🔥",
        title: "Streaks",
        description:
          "Not your average streak. Settle a split within 24 hrs and that's one. Keep it lit.",
      },
      {
        icon: "🎨",
        title: "Themes",
        description: "Pick your vibe. Themes for every mood now live.",
      },
      {
        icon: "😉",
        title: "Chats & Topics",
        description:
          "Quick convo on any topic, no pressure. We're not reinventing chat here btw.",
      },
      {
        icon: "🫶",
        title: "Share",
        description:
          "Pull in your roomies, your besties, your group chat — we got y'all covered.",
      },
    ],
    links: {
      appStore: "https://apps.apple.com/us/app/roamates/id6757687270",
      playStore:
        "https://play.google.com/store/apps/details?id=us.ephileo.roamates",
    },
  },
  {
    id: "chain-reaction",
    name: "Chain Reaction",
    tagline: "Explosive fun for everyone",
    description:
      "A strategic multiplayer game where you set off chain reactions to dominate the board. Simple to learn, endlessly engaging.",
    logo: "/projects/chain-reaction/logo.png",
    banner: "/projects/chain-reaction/banner.jpg",
    color: "#FF6B35",
    accentColor: "#FF8C61",
    type: "game",
    status: "released",
    links: {
      playStore:
        "https://play.google.com/store/apps/details?id=com.bhvp.chainreaction&hl=en",
      website: "https://bharath-bandaru.github.io/chain-reaction-game/",
    },
  },
  {
    id: "escape-game",
    name: "Escape Game",
    tagline: "Can you escape in time?",
    description:
      "A thrilling puzzle escape game that challenges your wit and problem-solving skills. Each room tells a story waiting to be unraveled.",
    logo: "/projects/escape-game/logo.png",
    banner: "/projects/escape-game/banner.png",
    color: "#6B4EE6",
    accentColor: "#8B71ED",
    type: "game",
    status: "released",
    links: {
      appStore:
        "https://apps.apple.com/us/app/escape-brain-teaser/id6743350755",
      playStore:
        "https://play.google.com/store/apps/details?id=com.bhvp.escapeGame&hl=en_US",
      website: "https://bharath-bandaru.github.io/escape-web/",
    },
  },
];

export const getProject = (id: string): Project | undefined => {
  return projects.find((p) => p.id === id);
};
