export type Block =
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][]; caption?: string }
  | { type: 'callout'; title?: string; text: string }
  | { type: 'quote'; text: string }
  | { type: 'cards'; items: { icon: string; title: string; text: string }[] };

export interface Post {
  slug: string;
  /** On-page H1. */
  title: string;
  /** <title> tag — keep under ~60 characters. */
  metaTitle: string;
  /** Meta description — keep under ~160 characters. */
  description: string;
  /** Lede shown under the H1 and on cards. */
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  keywords: string[];
  image: string;
  imageAlt: string;
  /** Project id from lib/projects.ts this post promotes. */
  project?: string;
  /** Short, self-contained answers — quotable by search snippets and AI assistants. */
  takeaways: string[];
  body: Block[];
  faq: { q: string; a: string }[];
}

const ROAMATES_PAGE = '/projects/roamates';
const APP_STORE = 'https://apps.apple.com/us/app/roamates/id6757687270';
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=us.ephileo.roamates';
const CR_PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.bhvp.chainreaction&hl=en';
const CR_WEB = 'https://bharath-bandaru.github.io/chain-reaction-game/';
const ESC_APP_STORE = 'https://apps.apple.com/us/app/escape-brain-teaser/id6743350755';
const ESC_PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.bhvp.escapeGame&hl=en_US';
const ESC_WEB = 'https://bharath-bandaru.github.io/escape-web/';
const MOI_CHICAGO = 'https://moichicago.com/';

export const posts: Post[] = [
  {
    slug: 'why-roamates-is-the-best-app-for-roommates',
    title: '12 Reasons Roamates Is the Easiest Way to Share a Home (or a Trip)',
    metaTitle: 'Roamates vs Splitwise: 12 Reasons to Pick Roamates',
    description:
      'Roamates is a free Splitwise alternative for roommates: share live notes and lists, rotate chores, split bills and chat on every expense. No ads, no limits.',
    excerpt:
      'Splitwise splits the bill. Roamates also runs the house: shared live notes, rotating chore schedules and a chat thread on every expense. It’s free, and here’s how the two compare.',
    publishedAt: '2026-10-13',
    updatedAt: '2026-10-13',
    tags: ['Roommate Life', 'Roamates', 'Expense Splitting'],
    keywords: [
      'roamates',
      'roamates app',
      'roamates vs splitwise',
      'splitwise alternative',
      'free splitwise alternative',
      'roommate app',
      'best app for roommates',
      'split bills with roommates',
      'chore schedule app for roommates',
      'chore rotation app',
      'shared notes app for roommates',
      'shared grocery list app',
      'roommate chat app',
      'group trip expense app',
    ],
    image: '/projects/roamates/roamates-post.jpg',
    imageAlt: 'Roamates app screens showing shared expenses, chore schedules, notes and comment threads for a group',
    project: 'roamates',
    takeaways: [
      '**Roamates** is a free app for iPhone and Android, made by Ephileo, that combines expense splitting with **shared live notes, chore schedules and chat threads** for roommates, couples and travel groups.',
      '**Unlike Splitwise**, which focuses on money, Roamates also handles the rest of shared living: whose turn it is, what’s on the grocery list, and the conversation about each bill.',
      '**Notes** are shared checklists and lists that several people edit at the same time, with live cursors.',
      '**Schedules** rotate chores automatically on a weekly, biweekly or monthly cycle, and housemates can swap turns and check in when they’re done.',
      '**Chat threads** come with every expense, note and schedule, with emoji reactions and “seen by” markers, so conversations stay attached to what they’re about.',
      'Receipt scanning and item-by-item splitting are Pro features in Splitwise. In Roamates they’re free, with no ads and no expense limits. Switching takes one CSV import.',
    ],
    body: [
      {
        type: 'p',
        text: 'Living with other people is mostly great. The friction comes from the small stuff: the electricity bill nobody has split yet, the grocery run three people chipped into, the trash that has quietly become one person’s job. Most households handle it with a group chat, a spreadsheet nobody updates and a lot of goodwill. That works until it doesn’t.',
      },
      {
        type: 'p',
        text: 'Splitwise fixed part of this: it made splitting the bill easy. But money is only half of sharing a home. [Roamates](/projects/roamates) covers the other half too, so the whole group runs the house from one app. Below are the twelve biggest reasons people pick it, a head-to-head with Splitwise, and a frank list of what Roamates doesn’t do yet.',
      },

      { type: 'h2', id: 'what-is-roamates', text: 'What is Roamates?' },
      {
        type: 'p',
        text: '**Roamates is a free mobile app for roommates, couples and travel groups.** It lets a group split shared expenses, see who owes whom, rotate chores on a schedule, keep shared notes and shopping lists, chat about any of it, and share live location. It runs on [iPhone](' + APP_STORE + ') and [Android](' + PLAY_STORE + '), and it is built by Ephileo, an independent app studio.',
      },
      {
        type: 'p',
        text: 'Every group you create is typed as **Home**, **Trip**, **Couple** or **Other**, so the same app covers your apartment, your weekend away and the running tab with your partner.',
      },

      { type: 'h2', id: 'notes-chat-schedules', text: 'More than a bill splitter: notes, chat and schedules' },
      {
        type: 'p',
        text: 'This is the biggest difference between Roamates and expense-only apps like Splitwise. The three features below are built for the parts of shared living that never show up on a receipt.',
      },
      {
        type: 'cards',
        items: [
          {
            icon: '📝',
            title: 'Notes',
            text: 'Shared grocery lists, checklists and quick polls that the whole house edits at the same time, with live cursors.',
          },
          {
            icon: '🗓️',
            title: 'Schedules',
            text: 'Chores rotate automatically, weekly, biweekly or monthly. Swap a turn, check in when it’s done, and everyone can see whose turn it is.',
          },
          {
            icon: '💬',
            title: 'Chat',
            text: 'Every expense, note and schedule has its own chat thread with reactions and “seen by” markers. No more digging through the group chat.',
          },
        ],
      },

      { type: 'h2', id: 'twelve-pros', text: 'The 12 pros of using Roamates' },

      { type: 'h3', text: '1. Shared notes and lists, edited together live' },
      {
        type: 'p',
        text: 'Notes in Roamates mix free text, **checklists** and **single-choice options**, and several people can edit the same note at once with **live cursors**. It’s a good fit for:',
      },
      {
        type: 'ul',
        items: [
          'A **shared grocery list** that everyone adds to through the week and ticks off at the store.',
          'A **move-in or move-out checklist** with deposits, keys, utilities and cleaning.',
          'A **packing list** for a group trip, so nobody brings the third speaker and forgets the charger.',
          'A **quick poll** on what to cook on Sunday or which weekend works for a house dinner.',
        ],
      },
      {
        type: 'p',
        text: 'Notes can belong to a whole group or be shared with just one or two people, so a gift list for a housemate’s birthday stays secret.',
      },

      { type: 'h3', text: '2. Chore schedules that rotate on their own' },
      {
        type: 'quote',
        text: 'Whose turn is it? Now everyone knows.',
      },
      {
        type: 'p',
        text: 'Create a schedule for trash, bathrooms, plants or the weekly grocery run. Set it to repeat **weekly, biweekly or monthly**, add the people involved, and Roamates rotates the turn automatically. When life happens, people can **swap a shift**. When the job’s done, they **check in** and everyone can see it. You can edit just this week or every week from now on, and nobody has to keep the chore wheel in their head.',
      },
      {
        type: 'p',
        text: 'Splitwise doesn’t do chores at all. In most homes, that means a whiteboard, a separate app, or a lot of “I did it last time.”',
      },

      { type: 'h3', text: '3. Chat on every expense, note and schedule' },
      {
        type: 'p',
        text: 'Group chats bury context. The question “wait, did this include the tip?” scrolls away under memes, and a month later nobody can find the answer. In Roamates, **every expense, every note and every schedule has its own chat thread**. Reply right on the thing you’re talking about, react with an emoji and see who has read it with **“seen by” markers**.',
      },
      {
        type: 'p',
        text: 'The result is a house conversation that organizes itself. Talk about the electricity bill on the bill, the bathroom rota on the schedule and the grocery list on the note. Notifications for chat can be muted separately from everything else.',
      },
      {
        type: 'callout',
        title: 'Why this matters',
        text: 'Most roommate arguments start with missing context, not missing money. Keeping the conversation next to the expense or chore it’s about takes that friction away.',
      },

      { type: 'h3', text: '4. It’s genuinely free, with no ads and no limits' },
      {
        type: 'p',
        text: 'Roamates has no premium tier, no daily expense cap, no ads and no paywall. Everyone in the group gets every feature. That matters more than it sounds: a roommate app only works if **everyone** joins and uses it, and limits or ads are what make people drift back to the group chat.',
      },

      { type: 'h3', text: '5. Four ways to split, with one or several payers' },
      {
        type: 'p',
        text: 'Real households don’t split everything 50/50. Roamates supports four split types:',
      },
      {
        type: 'ul',
        items: [
          '**Equal**: rent among three people, or Wi-Fi among four.',
          '**Exact amount**: when one person’s share of the utility bill is fixed.',
          '**Percentage**: the larger bedroom pays 40%.',
          '**Shares**: a couple counts as two shares and a single roommate as one.',
        ],
      },
      {
        type: 'p',
        text: 'If two people put a dinner on their cards, mark it as **paid by multiple people** and enter what each person paid. Roamates works out the balances.',
      },

      { type: 'h3', text: '6. Scan a receipt and split it item by item, for free' },
      {
        type: 'p',
        text: 'Point your camera at a grocery receipt, or pick a photo from your gallery, and Roamates reads the line items. You then assign each item to the people who share it: oat milk to one person, the shared olive oil to everybody. The scan runs **on your device**, so the receipt image isn’t uploaded anywhere. In Splitwise, receipt scanning and itemization are Pro features.',
      },

      { type: 'h3', text: '7. Settle up in the fewest possible payments' },
      {
        type: 'p',
        text: 'Turn on **Settle smartly** for a group and Roamates nets everyone’s debts together. Say Alex owes Sam, Sam owes Jordan and Jordan owes Alex. You don’t need three transfers to clear that loop. You get the shortest list of payments that clears every debt. When someone pays, record it in one tap, either for one group or across several groups at once.',
      },

      { type: 'h3', text: '8. Settle streaks make paying back a little fun' },
      {
        type: 'p',
        text: 'Settle a split within 24 hours and your **settle streak** grows. Streaks are tracked per group, with a group leaderboard. You also earn points for adding expenses, keeping schedules and sharing notes. A friendly nudge works better than awkwardly asking for money, and you can turn leaderboards off if competition isn’t your house’s vibe.',
      },

      { type: 'h3', text: '9. Multi-currency balances for trips abroad' },
      {
        type: 'p',
        text: 'Each expense can use any of **180+ currencies**, and Roamates keeps a separate balance in each one. A trip from Lisbon to London ends with a clear euro balance and a clear pound balance. Nothing gets silently converted at an exchange rate nobody agreed on.',
      },

      { type: 'h3', text: '10. Live location sharing you control' },
      {
        type: 'p',
        text: 'Skip the “where are you?” texts. Share your live location on a map with a whole group or with specific people. You can stop sharing with any group or person, or pause everything with one switch. **Nothing is shared until you choose who sees it.** You can also save places on the map and check the weather there, which helps when you’re planning a day out on a trip.',
      },

      { type: 'h3', text: '11. Expenses with friends outside a group' },
      {
        type: 'p',
        text: 'Not everything needs a group. Split a cab or concert tickets directly with a friend, and the balance between you two shows up in your friends list next to your group balances.',
      },

      { type: 'h3', text: '12. Balances on your home screen' },
      {
        type: 'p',
        text: 'Add the Roamates widget on iPhone or Android to see balances and recent expenses without opening the app. On iOS 17 and later you can choose which group the widget shows. Push notifications come in six categories (expenses, schedules, notes, chat, groups and location), and you can mute each one separately.',
      },

      { type: 'h2', id: 'roamates-vs-splitwise', text: 'Roamates vs. Splitwise' },
      {
        type: 'p',
        text: 'Splitwise is the best-known bill-splitting app, and it does that job well. The real question is whether your group needs only a bill splitter, or one app for the whole household. Here’s how they compare.',
      },
      {
        type: 'table',
        caption: 'Splitwise details are taken from splitwise.com/pro as of October 2026. Roamates is not affiliated with Splitwise.',
        head: ['Feature', 'Splitwise (free)', 'Splitwise Pro', 'Roamates'],
        rows: [
          ['Price', 'Free, with ads and a cap on expenses', 'Paid subscription', '**Free**, with no ads and no limits'],
          ['Equal, exact, percent and share splits', 'Yes', 'Yes', 'Yes'],
          ['Receipt scanning', 'No', 'Yes', '**Yes**, on-device'],
          ['Item-by-item splitting', 'No', 'Yes', '**Yes**'],
          ['Simplify debts', 'Yes', 'Yes', 'Yes (Settle smartly)'],
          ['Multiple currencies', 'Yes', 'Yes, plus conversion', 'Yes, separate balance per currency'],
          ['**Shared notes and lists**', 'No', 'No', '**Live, collaborative editing**'],
          ['**Chore schedules**', 'No', 'No', '**Rotating, with swaps and check-ins**'],
          ['**Chat**', 'Comments on expenses', 'Comments on expenses', '**Threads on expenses, notes and schedules, with reactions and “seen by”**'],
          ['Live location sharing', 'No', 'No', 'Yes, opt-in'],
          ['Settle streaks and leaderboards', 'No', 'No', 'Yes'],
          ['Pay through Venmo or PayPal links', 'Yes, in some countries', 'Yes, in some countries', 'No (records payments only)'],
          ['Web app', 'Yes', 'Yes', 'No, iPhone and Android only'],
        ],
      },
      {
        type: 'p',
        text: '**Choose Roamates** if you live with people, or travel with them, and want one free app for money, chores, lists and the conversation around them. **Splitwise may suit you better** if you only need to track money and want automatic currency conversion, in-app payment links or a web app.',
      },

      { type: 'h2', id: 'switching-from-splitwise', text: 'Switching from Splitwise? Bring your history with you' },
      {
        type: 'p',
        text: 'If your group already tracks expenses in Splitwise, you don’t have to start from zero. Export a CSV from Splitwise, import it into Roamates and match each person in the file to a Roamates member. Your past expenses and settlements come across intact, and you can set up schedules and notes from day one.',
      },

      { type: 'h2', id: 'who-its-for', text: 'Who Roamates is for' },
      {
        type: 'ul',
        items: [
          '**Roommates and housemates** splitting rent, utilities and groceries and sharing chores.',
          '**Couples** keeping a fair running tab and a shared to-do list without a joint account.',
          '**Travel groups** handling a trip’s costs in more than one currency, sharing a packing list and finding each other in a new city.',
          '**Friend groups** with an ongoing tab for dinners, concerts and game nights.',
          '**Student housing and co-living spaces**, where people move in and out and the history needs to stay put.',
        ],
      },

      { type: 'h2', id: 'getting-started', text: 'How to get started in about three minutes' },
      {
        type: 'ol',
        items: [
          'Download Roamates from the [App Store](' + APP_STORE + ') or [Google Play](' + PLAY_STORE + ') and sign in with Apple, Google or email.',
          'Look around the **demo group** Roamates creates for you. It has sample expenses, so you can see how balances work before adding real money.',
          'Create your group, pick **Home**, **Trip**, **Couple** or **Other**, and share the **invite link** in your existing group chat.',
          'Add the next shared bill, set up your first **chore schedule** and start a shared **grocery list note**.',
        ],
      },

      { type: 'h2', id: 'privacy', text: 'Privacy, in plain English' },
      {
        type: 'ul',
        items: [
          'Ephileo **does not sell your personal data** or use it for targeted advertising.',
          'Contacts are **hashed on your phone** before matching and are never stored in raw form.',
          'Passwords are hashed, and all traffic is encrypted in transit.',
          'Your location is shared only with the people and groups you pick, and you can stop at any time.',
          'You can request account deletion from the [account deletion page](/projects/roamates/delete-account). Full details are in the [privacy policy](/projects/roamates/privacy).',
        ],
      },

      { type: 'h2', id: 'limits', text: 'Where Roamates isn’t the right fit (yet)' },
      {
        type: 'p',
        text: 'No app does everything, and it’s better you hear the limits from us:',
      },
      {
        type: 'ul',
        items: [
          '**It doesn’t move money.** Roamates tracks and records settlements. You still pay each other with whatever you already use.',
          '**There’s no automatic currency conversion.** Each currency keeps its own balance, which is fairer but means you settle each one separately.',
          '**It’s mobile only.** Roamates runs on iPhone and Android, with no web app yet.',
          '**Full trip itineraries are still on the way.** Today, travel groups get expense splitting, live location, shared lists and saved places.',
        ],
      },

      { type: 'h2', id: 'bottom-line', text: 'The bottom line' },
      {
        type: 'p',
        text: 'Most roommate tension isn’t really about money or chores. It’s about **not knowing**: who paid, who owes, whose turn it is, and what was agreed. Splitwise answers the first two. Roamates answers all four, with shared notes, schedules and a chat thread on everything, and it’s free. It takes about three minutes to set up and works on everyone’s phone.',
      },
      {
        type: 'callout',
        title: 'Try it with your group',
        text: 'Get Roamates on the [App Store](' + APP_STORE + ') or [Google Play](' + PLAY_STORE + '), create your first group and drop the invite link in your group chat. You can also [see every feature](' + ROAMATES_PAGE + ').',
      },
    ],
    faq: [
      {
        q: 'Is Roamates a good Splitwise alternative?',
        a: 'Yes, especially for roommates. Roamates covers the core of Splitwise (equal, exact, percentage and share splits, simplified debts and multiple currencies) and includes receipt scanning and itemized splitting for free. It also adds shared live notes, chore schedules and a chat thread on every expense, note and schedule, none of which Splitwise has. You can import your Splitwise history with a CSV file.',
      },
      {
        q: 'Is Roamates free?',
        a: 'Yes. Roamates is free on iPhone and Android, with no subscription, no ads and no expense limits. Every feature is available to everyone in your group.',
      },
      {
        q: 'What is the best app for splitting bills and chores with roommates?',
        a: 'Roamates is built for exactly that. It splits bills four ways, scans receipts and settles debts in the fewest payments. It also rotates chores on weekly, biweekly or monthly schedules, keeps shared grocery lists and gives every expense and chore its own chat thread, all in one free app.',
      },
      {
        q: 'Can roommates chat inside Roamates?',
        a: 'Yes. Every expense, note and schedule in Roamates has its own chat thread with emoji reactions and “seen by” markers, so conversations stay attached to the bill or chore they’re about instead of getting lost in a group chat.',
      },
      {
        q: 'Can several people edit a Roamates note at the same time?',
        a: 'Yes. Notes support text, checklists and single-choice options, and multiple people can edit together in real time with live cursors. Notes can be shared with a whole group or with specific people.',
      },
      {
        q: 'How do chore schedules work in Roamates?',
        a: 'Create a schedule, pick who’s involved and set it to repeat weekly, biweekly or monthly. Roamates rotates the turn automatically. Housemates can swap shifts, check in when a chore is done, and edit one week or every week going forward.',
      },
      {
        q: 'Can I move my data from Splitwise to Roamates?',
        a: 'Yes. Export a CSV from Splitwise and import it into Roamates. You’ll match each person in the file to a Roamates member, and your expenses and settlements are brought over. Roamates is not affiliated with Splitwise.',
      },
      {
        q: 'Does Roamates send money between roommates?',
        a: 'No. Roamates tracks who owes whom and records settlements. You pay each other however you normally do, then mark the payment as settled in the app.',
      },
      {
        q: 'Which devices does Roamates work on?',
        a: 'Roamates is available for iPhone on the [App Store](' + APP_STORE + ') and for Android on [Google Play](' + PLAY_STORE + '). Both platforms also have a home-screen widget.',
      },
    ],
  },
  {
    slug: 'how-to-play-chain-reaction',
    title: 'How to Play Chain Reaction: Rules, Game Modes and 5 Tips to Win',
    metaTitle: 'How to Play Chain Reaction: Rules and Tips to Win',
    description:
      'Learn the Chain Reaction board game in two minutes: how orbs explode, how to win, how to play vs the computer or friends online, and five tips to win more.',
    excerpt:
      'Place orbs, fill a cell, watch it explode and take over your neighbors. Chain Reaction takes a minute to learn and a long time to master. Here’s everything you need to start winning.',
    publishedAt: '2026-10-13',
    updatedAt: '2026-10-13',
    tags: ['Games', 'Chain Reaction'],
    keywords: [
      'chain reaction game',
      'how to play chain reaction',
      'chain reaction rules',
      'chain reaction strategy',
      'chain reaction online multiplayer',
      'orb explosion game',
      'free strategy board game',
      'chain reaction android',
      'chain reaction browser game',
    ],
    image: '/projects/chain-reaction/banner.jpg',
    imageAlt: 'Chain Reaction game board with colored orbs exploding across the grid',
    project: 'chain-reaction',
    takeaways: [
      '**Chain Reaction** is a free strategy board game for 2–4 players by Ephileo. It runs on Android and in your web browser.',
      'Each turn you add an orb to an empty cell or to one of your own cells. When a cell fills up, it **explodes** into its neighbors and turns them your color.',
      'You win by **eliminating every other color** from the board.',
      'Play against the computer on three difficulty levels, pass-and-play with friends on one device, or play online with a **4-letter room code**.',
    ],
    body: [
      {
        type: 'p',
        text: 'Chain Reaction is one of those games you learn in a minute and keep playing for years. There’s no luck and no dice. Every move is yours, and one well-placed orb can flip the whole board. This guide covers the rules, the ways to play and a few tips that will win you more games.',
      },

      { type: 'h2', id: 'what-is-chain-reaction', text: 'What is Chain Reaction?' },
      {
        type: 'p',
        text: '**Chain Reaction is a free turn-based strategy game for 2 to 4 players.** Players take turns placing colored orbs on a grid. When a cell holds too many orbs, it explodes, pushing orbs into the cells around it and capturing them, which can set off more explosions. The last color left on the board wins. You can play it on [Android](' + CR_PLAY_STORE + ') or [in your browser](' + CR_WEB + '), with no account needed.',
      },

      { type: 'h2', id: 'rules', text: 'The rules in 60 seconds' },
      {
        type: 'ol',
        items: [
          'On your turn, tap an **empty cell** or a cell that **already has your orbs** to add one orb.',
          'Every cell has a limit based on how many neighbors it has. A **corner** cell explodes when it holds **2** orbs, an **edge** cell at **3**, and a **middle** cell at **4**.',
          'When a cell explodes, it sends one orb into each neighboring cell, and **those cells become your color**, including any orbs your opponent had there.',
          'If a neighbor fills up too, it explodes as well. That’s the **chain reaction**, and a single tap can cascade across the board.',
          'Once everyone has moved, any player with no orbs left is out. **The last color standing wins.**',
        ],
      },
      {
        type: 'callout',
        title: 'The one thing to remember',
        text: 'Corners explode fastest, and middles hold the most. Almost all of the strategy comes from that difference.',
      },

      { type: 'h2', id: 'game-modes', text: 'Ways to play' },
      {
        type: 'ul',
        items: [
          '**Vs. the computer**: play an AI opponent on Easy, Medium or Hard. It gets tougher as you beat it, so there’s always a challenge.',
          '**Pass-and-play**: 2 to 4 players share one phone or screen. It’s great for a table of friends.',
          '**Online with friends**: create a room, share the **4-letter room code**, and play together from different devices. Android and browser players can join the same room.',
        ],
      },
      {
        type: 'p',
        text: 'Games are played on a **6×9** board. On tablets and larger screens you can switch to a bigger **10×10** board for longer battles. There’s also an **undo** button for when a move goes badly, and a short **How to Play** guide inside the game.',
      },

      { type: 'h2', id: 'tips', text: '5 tips to win more games' },
      {
        type: 'ol',
        items: [
          '**Start in the corners.** Corners explode after just two orbs, so they’re the quickest way to start a chain.',
          '**Don’t sit next to a loaded enemy cell.** If your opponent’s cell is one orb from exploding, any of your cells beside it are about to change color.',
          '**Load up, then strike.** Build several cells that are one orb from exploding, then set off the one that starts the longest chain.',
          '**Count before you tap.** Before each move, check whether it hands your opponent an explosion on their next turn.',
          '**Play the long game in the middle.** Middle cells take four orbs to explode, so they make strong, slow-building reserves late in the game.',
        ],
      },

      { type: 'h2', id: 'why-play', text: 'Why people love it' },
      {
        type: 'ul',
        items: [
          '**Easy to learn, hard to master.** Anyone can learn the rules in a minute, but good players are still finding new tactics.',
          '**Quick rounds.** A game on the small board takes just a few minutes, which is perfect for a break.',
          '**Satisfying to watch.** Explosions ripple across the board with animations and a little confetti when you win.',
          '**Private by design.** There’s no sign-up and no profile, and the game collects as little data as possible. See the [privacy policy](/projects/chain-reaction/privacy).',
        ],
      },

      { type: 'h2', id: 'play-now', text: 'Play Chain Reaction now' },
      {
        type: 'p',
        text: 'Chain Reaction is free on [Google Play](' + CR_PLAY_STORE + ') and plays instantly [in your browser](' + CR_WEB + '). Start a game against the computer, or grab a friend, share a room code and see who causes the biggest chain reaction.',
      },
    ],
    faq: [
      {
        q: 'Is Chain Reaction free?',
        a: 'Yes. Chain Reaction is free on Android through Google Play, and free to play in your web browser.',
      },
      {
        q: 'How many players can play Chain Reaction?',
        a: 'Two to four players. You can play against the computer, pass one device around, or play online with friends using a 4-letter room code.',
      },
      {
        q: 'When does a cell explode in Chain Reaction?',
        a: 'A cell explodes when it holds as many orbs as it has neighbors: 2 for a corner, 3 for an edge cell and 4 for a middle cell. The orbs then spread to the neighboring cells and turn them your color.',
      },
      {
        q: 'Can I play Chain Reaction online with friends?',
        a: 'Yes. Create an online room, share the 4-letter code, and your friends can join from Android or from a web browser. No account is needed.',
      },
    ],
  },
  {
    slug: 'escape-sliding-block-puzzle-museum-of-illusions-chicago',
    title: 'Escape: The Sliding Block Puzzle I Found at the Museum of Illusions Chicago',
    metaTitle: 'Escape: A Sliding Puzzle Inspired by Museum of Illusions',
    description:
      'Escape is a free sliding block puzzle for iPhone, Android and the web, inspired by a puzzle at the Museum of Illusions Chicago. Slide the big block out of the box.',
    excerpt:
      'At the Museum of Illusions in Chicago I met a sliding block puzzle I couldn’t stop thinking about. I couldn’t find an app for it, so I built one.',
    publishedAt: '2026-10-13',
    updatedAt: '2026-10-13',
    tags: ['Games', 'Escape', 'Puzzles'],
    keywords: [
      'escape brain teaser',
      'escape puzzle game',
      'sliding block puzzle',
      'sliding block puzzle app',
      'museum of illusions chicago puzzle',
      'khun phan puzzle',
      'klotski puzzle app',
      'brain teaser game',
      'free puzzle game',
    ],
    image: '/projects/escape-game/banner.png',
    imageAlt: 'Escape sliding block puzzle board with the big green block and stone pieces',
    project: 'escape-game',
    takeaways: [
      '**Escape** is a free sliding block puzzle by Ephileo for iPhone, Android and the web.',
      'It was inspired by a sliding block puzzle at the **Museum of Illusions Chicago**.',
      'The goal is simple: slide the pieces around until the **big green block** reaches the gate at the bottom of the box.',
      'It’s a version of the classic **Khun Phan** puzzle, a cousin of Klotski. A move counter, a timer and a leaderboard track how efficiently you solve it.',
    ],
    body: [
      { type: 'h2', id: 'the-story', text: 'Where the idea came from' },
      {
        type: 'p',
        text: 'A while back I visited the [Museum of Illusions Chicago](' + MOI_CHICAGO + '). Alongside the optical illusions, there are hands-on puzzles to try, and one of them stuck with me: a box of blocks of different sizes, with one big block you had to slide out through a small opening.',
      },
      {
        type: 'p',
        text: 'It looks easy. It isn’t. Every piece blocks another, and the big block needs a surprisingly long path to get out. When I left I wanted to keep playing it on my phone, so I searched the Play Store. **I couldn’t find an app made for this specific puzzle.** There were plenty of number-sliding games and generic block puzzles, but nothing that recreated that layout and the feeling of solving it with your hands.',
      },
      {
        type: 'p',
        text: 'So I built it. **Escape** is my take on that puzzle: the same layout and the same goal, with smooth drag-to-slide controls, made to be picked up whenever you have a few minutes.',
      },

      { type: 'h2', id: 'what-is-escape', text: 'What is Escape?' },
      {
        type: 'p',
        text: '**Escape is a free sliding block puzzle game for iPhone, Android and the web.** The board is a box four cells wide and five tall, filled with ten pieces: one big 2×2 block, four tall blocks, one wide block and four small squares. Two cells are empty. Your job is to slide the pieces around until the big green block escapes through the gate at the bottom.',
      },
      {
        type: 'p',
        text: 'The puzzle is known in Thailand as **Khun Phan**, after a hero of Thai folklore who has to escape his captors. It belongs to the same family as the Chinese **Klotski** (Huarong Dao) and the Japanese **Hakoiri Musume**.',
      },

      { type: 'h2', id: 'how-to-play', text: 'How to play' },
      {
        type: 'ol',
        items: [
          '**Drag** any piece into an empty space next to it. Pieces can only slide, never jump or rotate.',
          'Clear a path for the **big green block** by moving the smaller pieces out of its way.',
          'Guide the big block down to the **gate**, the green opening at the bottom of the box.',
          'When it escapes, you’ll see your **number of moves** and **time**, and where you rank on the leaderboard.',
        ],
      },
      {
        type: 'callout',
        title: 'In one line',
        text: 'Bring the big green block out of the box in as few moves as you can.',
      },

      { type: 'h2', id: 'tips', text: '3 tips for your first escape' },
      {
        type: 'ol',
        items: [
          '**Think about the two empty cells.** Every move just moves the gaps around. Plan where you want them to be, not where the pieces go.',
          '**Use the small squares as gap-shufflers.** They’re the easiest pieces to tuck away and bring back later.',
          '**Expect to move the big block away from the gate first.** The best routes often go sideways or even up before they come down.',
        ],
      },

      { type: 'h2', id: 'features', text: 'What’s in the app' },
      {
        type: 'ul',
        items: [
          '**Smooth drag-to-slide controls** that snap pieces cleanly into the grid.',
          '**A move counter and a timer**, so every solve is something to beat.',
          'A **leaderboard** that ranks players by fewest moves, then fastest time. On iPhone it uses Game Center.',
          'A short **How to Play** guide and a little celebration when you escape.',
          'It’s available on [iPhone](' + ESC_APP_STORE + '), [Android](' + ESC_PLAY_STORE + ') and [the web](' + ESC_WEB + ').',
        ],
      },

      { type: 'h2', id: 'play-now', text: 'Try it yourself' },
      {
        type: 'p',
        text: 'If you’ve been to the Museum of Illusions and remember that puzzle, this one’s for you. If you haven’t, it’s a great first brain teaser either way. Download Escape on the [App Store](' + ESC_APP_STORE + ') or [Google Play](' + ESC_PLAY_STORE + '), or [play it in your browser](' + ESC_WEB + ') right now.',
      },
    ],
    faq: [
      {
        q: 'Is Escape free?',
        a: 'Yes. Escape is free to download on iPhone and Android, and free to play in your web browser.',
      },
      {
        q: 'What puzzle is Escape based on?',
        a: 'Escape is based on the classic Khun Phan sliding block puzzle, a relative of Klotski. It was inspired by a version of the puzzle at the Museum of Illusions Chicago.',
      },
      {
        q: 'How do you win Escape?',
        a: 'Slide the pieces until the big green 2×2 block reaches the gate at the bottom of the box. Pieces can only slide into empty spaces, and the leaderboard ranks solves by fewest moves, then fastest time.',
      },
      {
        q: 'Is Escape affiliated with the Museum of Illusions?',
        a: 'No. Escape is an independent game by Ephileo, inspired by a puzzle the developer played at the Museum of Illusions Chicago.',
      },
    ],
  },
  {
    slug: 'about-ephileo-technology-that-brings-people-together',
    title: 'Ephileo: Building Technology That Brings People Closer',
    metaTitle: 'About Ephileo: Apps Built to Bring People Together',
    description:
      'Ephileo is an independent studio behind Roamates, Chain Reaction and Escape. We build apps that bring people together, and we are looking for what to build next.',
    excerpt:
      'Who we are, what we’ve built, and the kind of product we’re searching for next: something that helps people in a real way and brings them closer, rather than keeping them stuck to a screen.',
    publishedAt: '2026-10-13',
    updatedAt: '2026-10-13',
    tags: ['Company', 'Ephileo'],
    keywords: [
      'ephileo',
      'ephileo apps',
      'about ephileo',
      'independent app studio',
      'apps that bring people together',
      'humane technology',
      'roamates',
      'chain reaction game',
      'escape puzzle game',
    ],
    image: '/blog/ephileo-hero.jpg',
    imageAlt: 'People gathered around a campfire in the Ephileo 3D city, under the line “we build products people love.”',
    takeaways: [
      '**Ephileo** is an independent app studio. It makes Roamates, a free app for roommates and travel groups, and two free games, Chain Reaction and Escape.',
      'We build technology that **helps people connect with each other**, not technology that keeps them hooked on a screen.',
      'We’re **looking for our next product**: something that helps people in a meaningful way and is built to bring them together.',
      'If you have a problem worth solving or an idea, we’d love to hear it through our [contact form](/#contact).',
    ],
    body: [
      {
        type: 'p',
        text: 'Most apps today are built to keep you on them. Every notification, every infinite feed and every red badge is tuned to get a little more of your time. We started Ephileo because we wanted to build the other kind: technology that does its job, gets out of the way and leaves you with more time for the people around you.',
      },

      { type: 'h2', id: 'who-we-are', text: 'Who we are' },
      {
        type: 'p',
        text: '**Ephileo is a small, independent app studio.** We design and build mobile apps and games ourselves, end to end, from the first sketch to the version in your pocket. Our motto is simple: “we build products people love.” In practice, that means caring about the small details, keeping things fast and simple, and treating the people who use our apps with respect.',
      },

      { type: 'h2', id: 'what-we-build', text: 'What we’ve built so far' },
      {
        type: 'p',
        text: 'Each of our products started from something real in our own lives, and each one is meant to be used **with** other people:',
      },
      {
        type: 'ul',
        items: [
          '**[Roamates](/projects/roamates)**: one free app for living or travelling together. It covers shared notes and lists, rotating chore schedules, bill splitting and a chat thread on everything. It exists to take the awkwardness out of sharing a home, so roommates can just be friends. See [how it compares with Splitwise](/blog/why-roamates-is-the-best-app-for-roommates).',
          '**[Chain Reaction](/projects/chain-reaction)**: a strategy game that’s at its best with friends around one phone or in an online room. Learn it in a minute and argue about it for an hour. Here’s [how to play](/blog/how-to-play-chain-reaction).',
          '**[Escape](/projects/escape-game)**: a sliding block puzzle inspired by a puzzle at the Museum of Illusions Chicago. It started with a real-world moment we wanted to share. Read [the story behind it](/blog/escape-sliding-block-puzzle-museum-of-illusions-chicago).',
        ],
      },

      { type: 'h2', id: 'what-we-believe', text: 'What we believe' },
      {
        type: 'ul',
        items: [
          '**Technology should bring people closer.** The best thing an app can do is help you spend better time with others, whether you’re settling up, planning a trip or playing a game across the table.',
          '**Respect people’s time and attention.** We don’t want to build feeds you can’t put down. A good product helps you get something done and lets you go.',
          '**Respect people’s data.** We don’t sell personal data, and we try to collect as little as possible. Chain Reaction doesn’t even ask you to sign up.',
          '**Simple beats clever.** If a feature needs a manual, it isn’t finished yet.',
          '**Keep it accessible.** All of our apps are free to download, so nobody gets left out of the group.',
        ],
      },

      { type: 'h2', id: 'what-we-are-aiming-for', text: 'What we’re aiming for' },
      {
        type: 'p',
        text: 'We judge our work by one question: **are people better off for using it?** Not by how many hours they spend inside it, but by whether a household runs a bit more smoothly, a friendship skips an awkward money conversation, or a group of friends gets one more good evening together.',
      },
      {
        type: 'p',
        text: 'Over time we want Ephileo to be known for a small family of products that each solve one real problem well and point people back toward each other.',
      },

      { type: 'h2', id: 'whats-next', text: 'What’s next: searching for our next product' },
      {
        type: 'p',
        text: 'Right now, we’re **searching for the next thing to build**, and we’re being picky about it. We’re not looking for another app that’s designed to keep people stuck to their phones. We’re looking for a product that **helps people in a genuinely good way** and is **built to connect them with each other**.',
      },
      {
        type: 'p',
        text: 'Every idea we explore has to pass a few tests:',
      },
      {
        type: 'ol',
        items: [
          '**Does it solve a real problem** that people actually have, not one we invented?',
          '**Does it bring people closer**, to friends, family, roommates or their community?',
          '**Would people feel good closing the app?** If success depends on them never leaving, it isn’t for us.',
          '**Can it stay simple** enough that anyone in the group can use it on day one?',
        ],
      },
      {
        type: 'callout',
        title: 'Have an idea for us?',
        text: 'If there’s a problem in your life that technology could help with, especially one that involves other people, we’d genuinely love to hear about it. [Get in touch](/#contact) or email [admin@ephileo.us](mailto:admin@ephileo.us).',
      },

      { type: 'h2', id: 'bottom-line', text: 'Thanks for being here' },
      {
        type: 'p',
        text: 'Whether you split rent with Roamates, start rivalries with Chain Reaction or lost an afternoon to Escape, thank you. Every review, bug report and suggestion shapes what we build next. We’re just getting started.',
      },
    ],
    faq: [
      {
        q: 'What is Ephileo?',
        a: 'Ephileo is an independent app studio that designs and builds mobile apps and games. Its products include Roamates, Chain Reaction and Escape.',
      },
      {
        q: 'What apps has Ephileo made?',
        a: 'Ephileo has made Roamates, an app for roommates and travel groups with shared notes, chore schedules, expense splitting and chat. It has also made two games: Chain Reaction, a 2–4 player strategy game, and Escape, a sliding block puzzle.',
      },
      {
        q: 'Are Ephileo’s apps free?',
        a: 'Yes. Roamates, Chain Reaction and Escape are all free to download.',
      },
      {
        q: 'What is Ephileo working on next?',
        a: 'Ephileo is looking for its next product: something that helps people in a genuinely good way and is built to connect them with each other, rather than to keep them on their screens. Ideas are welcome through the contact form at ephileo.us.',
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export function readingMinutes(post: Post) {
  const text = [
    ...post.takeaways,
    ...post.body.flatMap((b) => {
      switch (b.type) {
        case 'ul':
        case 'ol':
          return b.items;
        case 'table':
          return b.rows.flat();
        case 'cards':
          return b.items.flatMap((c) => [c.title, c.text]);
        default:
          return [b.text];
      }
    }),
    ...post.faq.flatMap((f) => [f.q, f.a]),
  ].join(' ');
  return Math.max(1, Math.round(text.split(/\s+/).length / 230));
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
