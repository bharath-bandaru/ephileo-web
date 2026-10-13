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
  /** Search/AI metadata for the project page. */
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const projects: Project[] = [
  {
    id: "roamates",
    name: "Roamates",
    tagline: "Your journey, together",
    description:
      "Shared notes and lists, rotating chore schedules, bill splitting, and live location — with a chat thread on every expense, note, and schedule. Track balances, settle up in the fewest payments, and keep your streak alive. Free, with no ads. All in one app.",
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
        icon: "💸",
        title: "Split It Your Way",
        description:
          "Equal, exact, percent, or shares — or scan the receipt and split it item by item.",
      },
      {
        icon: "😉",
        title: "Chat on Everything",
        description:
          "Every expense, note, and schedule gets its own thread. We're not reinventing chat here btw.",
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
    seo: {
      title: "Roamates – Free App for Roommates: Notes, Chores & Bill Splitting",
      description:
        "Free iPhone and Android app for roommates and travel groups: shared notes, chore schedules, bill splitting, and live location. A free Splitwise alternative.",
      keywords: [
        "roamates",
        "roommate app",
        "splitwise alternative",
        "split bills with roommates",
        "chore schedule app",
        "shared grocery list app",
      ],
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
    seo: {
      title: "Chain Reaction – Free Multiplayer Strategy Game for 2–4 Players",
      description:
        "Free strategy board game for 2–4 players on Android and the web. Trigger chain reactions vs. the computer, in pass-and-play, or online with friends.",
      keywords: [
        "chain reaction game",
        "chain reaction online multiplayer",
        "strategy board game",
        "orb explosion game",
      ],
    },
  },
  {
    id: "escape-game",
    name: "Escape Game",
    tagline: "Can you find the way out?",
    description:
      "A sliding block puzzle inspired by one at the Museum of Illusions Chicago. Slide the pieces and guide the big green block out of the box — in as few moves as you can.",
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
    seo: {
      title: "Escape: Brain Teaser – Free Sliding Block Puzzle",
      description:
        "Free sliding block puzzle for iPhone, Android, and the web, inspired by the Museum of Illusions Chicago. Slide the big green block out in the fewest moves.",
      keywords: [
        "escape brain teaser",
        "sliding block puzzle",
        "klotski puzzle app",
        "khun phan puzzle",
        "museum of illusions puzzle",
      ],
    },
  },
];

export const getProject = (id: string): Project | undefined => {
  return projects.find((p) => p.id === id);
};
