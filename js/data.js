// Google Student Ambassador Program Data Configuration
// Source: https://portal.geministudentambassador.com

window.GSA_DATA = {
  // Ambassador Profile
  defaultProfile: {
    name: "Rishi",
    gid: "965",
    email: "rishi.gsa@gmail.com",
    college: "Campus Ambassador",
    state: "India",
    cohort: "November 2026",
    role: "Google Student Ambassador"
  },

  // Ambassadors participants can select when joining a campus contest.
  ambassadors: [
    { id: "rishi", name: "Rishi N Solanki", gid: "965", email: "rishisolanki7319@gmail.com", password: "Rishi@965", signature: "assets/signature/rishi-signature.png" },
    { id: "hetvi", name: "Hetvi A Dodiya", gid: "14736", email: "hetvidodiya2447@gmail.com", password: "Hetvi@14736", signature: "assets/signature/hetvi-signature.png", signatureCrop: { x: 0, y: 210, width: 560, height: 360 } },
    { id: "janak", name: "Janak Gajjar", gid: "1908", email: "jgajjar1885@gmail.com", password: "Janak@1908", signature: "assets/signature/janak.jpeg", signatureCrop: { x: 165, y: 150, width: 620, height: 175 } },
    { id: "kunal", name: "Kunal Teli", gid: "1312", email: "kunalteli29883@gmail.com", password: "Kunal@1312", signature: "assets/signature/kunal-signature.png" },
    { id: "mohit", name: "Mohit Mukvana", gid: "1588", email: "17mohit1755@gmail.com", password: "Mohit@1588" }
  ],

  // Participant Session Information
  participantSession: {
    workshopTheme: "Game On Night : Imagine The Impossible",
    sessionDate: "November 2026",
    toolUsed: "Google Gemini 1.5 Pro & Gemini Canvas",
    promptText: "Act as an innovative game concept designer. Create a unique campus game that blends physical exploration with real-time AI clues using Google Gemini. Outline the core rules, team scoring, and a 3-step interactive prototype plan.",
    // Product Trial Links
    productTrialPreSurvey: "https://producttrialsurvey.geministudentambassador.com/",
    productTrialFeedback: "https://producttrialfeedback.geministudentambassador.com/",
    // Product Understanding Links
    productUnderstandingPreSurvey: "https://productunderstandingpre.geministudentambassador.com/",
    productUnderstandingPostSurvey: "https://productunderstandingpost.geministudentambassador.com/",
    productUnderstandingTutorialDrive: "https://drive.google.com/drive/folders/1kMIfA74eTwhtdb3NXB0-6q7PD8BLxeGV",
    productUnderstandingVideoSubmission: "https://productunderstanding.geministudentambassador.com"
  },

  certificate: {
    template: "assets/certifications/Certificate of Participation (1).jpg"
  },

  // 5 Master Prompt Kits for Students to Fill Google Form
  masterPrompts: [
    {
      id: "ember-run",
      title: "Last Light: Operation Ember Run",
      tag: "Action Team Adventure",
      tagline: "Collaborative survival race to restore a blackout city before dawn",
      yourBuild: "My game concept is “Last Light: Operation Ember Run”: a fun team adventure game (solo, duo, squad or 5v5) where players race to bring a dark city’s lights back on before sunrise. It has one clear goal, one tricky enemy, and one ticking deadline. Teams navigate campus waypoints, solve encrypted power substation relays using Gemini, and defend their generator batteries from shadow glitches.",
      nanoPrompt: "Design an immersive campus fest game stall called 'Last Light: Operation Ember Run'. The game is a cooperative physical-digital hybrid challenge where squads of 2-5 players race against a 15-minute countdown clock to restore power to a blackout city map. Provide: 1) Stall visual theme & setup with neon emergency lighting, 2) Core gameplay loop (substation puzzle cracking, resource battery transfers, and shadow glitch saboteurs), 3) Three specific puzzle mechanics solved via Gemini multimodal prompts, 4) Victory conditions and live scoreboard formula.",
      followUpPrompts: [
        "1. Make the substation relay puzzles physically interactive so teams have to run to 3 different corners of the fest stall to complete wire sequencing while keeping individual round times strictly under 4 minutes.",
        "2. Introduce a dynamic 'Shadow Glitch' event that triggers every 3 minutes, forcing one player to solve a rapid-fire Gemini anagram prompt while teammates protect their battery pack.",
        "3. Provide a printable score calculation matrix factoring in time remaining, sub-station power efficiency percentage, and bonus points for zero-hint puzzle completions."
      ],
      theIdea: "We utilized Gemini 1.5 Pro with Gemini Canvas to brainstorm the live puzzle flow and simulate player decision trees under tight time limits. One thing I would love to see in Nano Banana / Gemini Chat is persistent interactive canvas state across prompt branches—allowing live adjustment of game balance variables (like countdown timers or player HP) through an interactive slider UI.",
      theFriction: "Gemini initially kept generating sprawling open-world video game mechanics rather than practical physical fest-stall rules. We had to push through by explicitly specifying constraints: stall footprint of 10x10 feet, 15-minute maximum player turnover, and low-cost tangible props (glowsticks, QR tags, paper circuit schematics). Once anchored to real-world physical bounds, the outputs became actionable.",
      theWin: "The 'Emergency Generator Overclock' rule came together brilliantly—it generated a pulse-racing finale where teams sacrifice 20% of their battery to buy 60 extra seconds. The visual atmospheric description of the stall ('ambient blue emergency beacons flickering as substations light up') created an immediate crowd magnet during the fest."
    },
    {
      id: "campus-heist",
      title: "Campus Heist: The Dean's Lost Archive",
      tag: "AR Mystery Trail",
      tagline: "Augmented-reality campus detective trail cracking encrypted historical archives",
      yourBuild: "My game concept is “Campus Heist: The Dean’s Lost Archive”: an augmented reality detective adventure where squads of students act as secret cyber-investigators racing against time to recover an encrypted campus archive before unauthorized deletion. Players interrogate dynamic AI personas using Gemini, decode campus landmark clues, and bypass digital security locks.",
      nanoPrompt: "Generate an interactive campus festival mystery trail game named 'Campus Heist: The Dean's Lost Archive'. Players form detective agencies of 3-4 students and use Gemini Chat as their rogue AI informant 'Cipher-9'. Provide: 1) Complete narrative backstory of the archive heist, 2) 4-stage clue progression tied to common university landmarks (library, clocktower, amphitheater, tech lab), 3) Riddle prompts with escalating difficulty and hints ladder, 4) A dramatic 10-minute terminal countdown finale at the fest booth.",
      followUpPrompts: [
        "1. Write the persona system prompt for 'Cipher-9' so it responds in cryptic, witty hacker dialogue and only dispenses progressive hints if students ask technically creative questions.",
        "2. Refine the 4 campus landmark riddles so each clue requires cross-referencing physical architecture details with an encrypted riddle poem generated by Gemini.",
        "3. Design a rapid physical lockbox puzzle for the fest stall booth where the final decoded cipher opens an actual illuminated prize vault."
      ],
      theIdea: "We leveraged Gemini Chat for dynamic narrative branch generation and automated clue verification. A feature I would love in Nano Banana or Gemini Chat is native multimodal camera integration that can verify physical landmark photographs submitted by players against the riddle solution in real time.",
      theFriction: "In initial prompts, the riddles were either trivially easy or ridiculously abstract for students walking between stalls. We had to iterate multiple times, enforcing a strict rule: 'each clue must reference exactly one visible physical object (like a statue plaque year or pillar count) and encode it using an alphanumeric shift cipher'.",
      theWin: "The rogue AI persona 'Cipher-9' landed with perfection. Its snappy, slightly sarcastic hacker persona made students laugh out loud, and participants genuinely felt like they were in an interactive thriller movie."
    },
    {
      id: "bytecraft-arena",
      title: "ByteCraft Arena: Code & Conquer",
      tag: "Strategy Card Battles",
      tagline: "Turn-based tactical code-warriors battling dynamic firewall bosses",
      yourBuild: "My game concept is “ByteCraft Arena: Code & Conquer”: a high-energy tabletop and AI card duel where players build algorithmic hero squads (Syntax Sentinel, Logic Knight, Async Archer) to battle rogue firewall bosses. Matches are fast (5-7 minutes), highly tactical, and require zero prior programming knowledge to enjoy.",
      nanoPrompt: "Design an approachable, fast-paced esports card duel game stall called 'ByteCraft Arena: Code & Conquer'. Non-coders and engineers alike compete in 5-minute head-to-head tactical battles using code-themed superpower cards. Generate: 1) 12 unique hero cards with balanced stats (Attack, Defense, Glitch Resistance, Mana Cost), 2) Turn sequence rules and counter-attack mechanics, 3) Visual card artwork layout specifications, 4) The 'Boss Raid' cooperative mode for crowds at the fest stall.",
      followUpPrompts: [
        "1. Balance the stats of the 12 hero cards into a stone-paper-scissors dynamic so no single deck configuration is overpowered, ensuring a 50% win rate across 10 simulated matches.",
        "2. Create 5 spectator challenge cards where audience members in the crowd can cast spontaneous 'Chaos Interrupts' to shift the battlefield during live stage duels.",
        "3. Produce concise, single-page visual cheat-sheet instructions that explain all gameplay rules to new players in under 45 seconds."
      ],
      theIdea: "We used Gemini to simulate hundreds of card combat rounds and verify mathematical stat parity across character decks. An awesome future capability in Nano Banana would be instant card asset export with customized vector borders and stat badges ready for direct printing onto standard playing cards.",
      theFriction: "Gemini kept outputting wall-of-text card explanations that were too wordy for cards. We pushed through by constraining outputs to a strict 4-line markdown card template: Name, Mana, Stat Line, Special Ability (max 12 words). This made every card punchy and readable at a glance.",
      theWin: "The 'Stack Overflow' comeback mechanic—where taking critical damage allows a player to draw 3 emergency glitch cards—created thrilling spectator moments during our trial tournament."
    },
    {
      id: "echoes-tomorrow",
      title: "Echoes of Tomorrow: Eco-Squad Quest",
      tag: "Sustainability Simulation",
      tagline: "Collaborative campus simulation optimizing green energy before climate deadline",
      yourBuild: "My game concept is “Echoes of Tomorrow: Eco-Squad Quest”: a collaborative campus simulation quest where players step into the shoes of campus environmental architects racing against a simulated 2030 climate deadline. Squads manage energy budgets, allocate renewable power grids, and resolve emergency pollution crises.",
      nanoPrompt: "Create an interactive campus sustainability quest and booth activation named 'Echoes of Tomorrow: Eco-Squad Quest'. Teams of students act as campus sustainability directors balancing three meters: Campus Energy, Green Index, and Student Happiness. Provide: 1) Interactive booth setup featuring an illuminated physical campus dashboard, 2) 5 crisis decision cards with real-world environmental trade-offs, 3) Gemini scoring algorithm that evaluates creative student proposals, 4) Rewarding badge milestones.",
      followUpPrompts: [
        "1. Calibrate the energy trade-off math to reflect realistic university metrics (solar roof installations vs. cafeteria food waste composting vs. EV campus shuttles).",
        "2. Add a spontaneous 'Flash Climate Crisis' mechanic (e.g. sudden monsoon power outage) that forces teams to formulate a 2-minute emergency response pitch evaluated by Gemini.",
        "3. Format the final scoring formula into a transparent rubric awarding bonus points for innovative circular-economy student ideas."
      ],
      theIdea: "We used Gemini Canvas to calculate complex ecological trade-off algorithms while maintaining an engaging narrative tone. A dream feature for Gemini Chat would be real-time integration with live campus sensor feeds (like campus temperature or solar panel generation) to drive dynamic in-game events.",
      theFriction: "Gemini's first draft treated sustainability as a dull multiple-choice quiz. We fought for an interactive crisis-management format by instructing it: 'Design this like SimCity meets Apollo 13—high tension, limited resources, and unexpected ethical dilemmas that provoke team debates'.",
      theWin: "The cafeteria food waste scenario provoked animated, passionate discussions among participants. Students stayed at our booth long after their turn ended just to discuss how they could implement their game solutions in real campus life."
    },
    {
      id: "quantum-tag",
      title: "Quantum Tag: The Dimension Glitch",
      tag: "Physical Sports & AI",
      tagline: "Playground tag upgraded with quantum superpowers and live AI refereeing",
      yourBuild: "My game concept is “Quantum Tag: The Dimension Glitch”: a high-adrenaline physical sports game that upgrades playground tag with quantum physics superpowers (Phasing, Teleportation, Time Dilation). Gemini serves as the live AI referee, announcing random dimension rifts and calculating cooldowns in real time.",
      nanoPrompt: "Design an energetic, physical-digital hybrid sport for college fests titled 'Quantum Tag: The Dimension Glitch'. Played in a designated outdoor courtyard with color-coded wearable bands. Gemini acts as the live voice referee and dimension announcer. Provide: 1) Court boundaries and safety guidelines, 2) 4 Quantum Superpowers with cooldowns and counters, 3) AI referee voice script and event triggers, 4) Fast-paced 3-minute round structure with instant winner adjudication.",
      followUpPrompts: [
        "1. Develop 6 spontaneous 'Dimension Shift' events announced by Gemini over a loudspeaker that temporarily invert arena rules (e.g. 'Anti-Gravity: Everyone must move in slow motion').",
        "2. Establish crystal-clear, non-contact tag validation protocols to ensure complete player safety while maintaining high competitive speed.",
        "3. Draft an automated referee scorecard template where match outcomes, tag counts, and power-up usage are tallied in under 30 seconds."
      ],
      theIdea: "We leveraged Gemini's voice synthesis capability and rapid rule synthesis to adjudicate ambiguous gameplay disputes on the fly. In the future, voice-activated hands-free prompt execution would make Gemini the ultimate sideline referee for outdoor physical sports.",
      theFriction: "Balancing the 'Teleportation' power-up was tough—players initially abused safe zones. We pushed through by prompting Gemini: 'Introduce a risk-reward cost to teleporting: entering a safe zone drains 50% of your squad's dimension energy'.",
      theWin: "The 'Dimension Shift: Zero Gravity' announcement over the PA speaker had the entire crowd cheering as runners dramatically moved in slow motion. It was the most viral, recorded moment of our entire festival activation."
    }
  ],

  // Reward Tiers & Milestones
  tiers: [
    {
      name: "Starter",
      badgeLabel: "STARTER BADGE",
      tierTag: "Bronze",
      minPoints: 0,
      maxPoints: 899,
      badge: "assets/The Spark.png",
      rewards: "Welcome Kit & Onboarding Access",
      digitalRewards: "GSA Starter Access",
      isStarter: true
    },
    {
      name: "The Spark",
      badgeLabel: "THE SPARK",
      tierTag: "Bronze",
      minPoints: 900,
      maxPoints: 1649,
      badge: "assets/The Spark.png",
      rewards: "Branded Bottle + Rs 500 E-voucher",
      digitalRewards: "Digital Badge"
    },
    {
      name: "The Trailblazer",
      badgeLabel: "THE TRAILBLAZER",
      tierTag: "Silver",
      minPoints: 1650,
      maxPoints: 2399,
      badge: "assets/The Trailblazer.png",
      rewards: "Rs 500 E-voucher",
      digitalRewards: "Digital Badge"
    },
    {
      name: "The Changemaker",
      badgeLabel: "THE CHANGEMAKER",
      tierTag: "Gold",
      minPoints: 2400,
      maxPoints: 3149,
      badge: "assets/The Changemaker.png",
      rewards: "Power Bank + Rs 1,000 E-voucher",
      digitalRewards: "Digital Badge + Certificate of Perseverance / Certificate of Completion"
    },
    {
      name: "The Powerhouse",
      badgeLabel: "THE POWERHOUSE",
      tierTag: "Platinum",
      minPoints: 3150,
      maxPoints: 3899,
      badge: "assets/The Powerhouse.png",
      rewards: "Rs 1,000 E-voucher",
      digitalRewards: "Digital Badge"
    },
    {
      name: "The Luminary",
      badgeLabel: "THE LUMINARY",
      tierTag: "Diamond",
      minPoints: 3900,
      maxPoints: 4649,
      badge: "assets/The Luminary.png",
      rewards: "Bluetooth Speaker + Rs 2,500 E-voucher",
      digitalRewards: "Digital Badge + Certificate of Prominence"
    },
    {
      name: "The Vanguard",
      badgeLabel: "THE VANGUARD",
      tierTag: "Master",
      minPoints: 4650,
      maxPoints: 5399,
      badge: "assets/The Vanguard.png",
      rewards: "Rs 5,000 Performance Incentive",
      digitalRewards: "Digital Badge"
    },
    {
      name: "The Legend",
      badgeLabel: "THE LEGEND",
      tierTag: "Grandmaster",
      minPoints: 5400,
      maxPoints: 10000,
      badge: "assets/The Legend.png",
      rewards: "Rs 10,000 Performance Incentive",
      digitalRewards: "Digital Badge + Certificate of Ascendancy"
    }
  ],

  // Official Tasks matching portal.geministudentambassador.com
  tasks: [
    {
      id: "product-trials",
      title: "Product Trials",
      type: "Mandatory Task",
      category: "Mandatory",
      pointsText: "Up to 1200 Points",
      minPoints: 120,
      maxPoints: 1200,
      pointsPerUnit: 12,
      unitName: "participants",
      minUnits: 10,
      maxUnits: 100,
      parameters: "Min 10 participants, Max 100 Participants ( 12pts per participant)",
      monthBriefTheme: "Game On Night : Imagine The Impossible",
      briefHtml: 'Every month, we drop a new Fun Night theme- a Gemini Feature, wild creative brief, and <span class="font-bold bg-[linear-gradient(90deg,#EA4335,#FBBC04,#34A853,#4285F4)] bg-clip-text text-transparent">one mission</span>: get your campus to make something.',
      forms: [
        { name: "Step 1 - Pre Survey Form", link: "https://producttrialsurvey.geministudentambassador.com/" },
        { name: "Step 2 - Book Your Google Meet", link: "https://producttrialpre.geministudentambassador.com/" },
        { name: "Step 3 - Nominate the best entry", link: "https://producttrialpost.geministudentambassador.com/" },
        { name: "Step 4 - Participant Feedback", link: "https://producttrialfeedback.geministudentambassador.com/" }
      ],
      completion: {
        completed: false,
        participantsCount: 0,
        sessionDate: "",
        meetLink: "",
        proofDriveUrl: "",
        surveySheetUrl: "",
        bestEntryNomination: "",
        notes: ""
      }
    },
    {
      id: "content-creation",
      title: "Content Creation",
      type: "Mandatory Task",
      category: "Mandatory",
      pointsText: "Up to 600 Points",
      minPoints: 300,
      maxPoints: 600,
      fixedPoints: 300,
      parameters: "1 Authenticated Reel + 1 Authenticated LinkedIn Post. 300 Fixed + Incentive (Reel: >1K views: 75 pts, >4K views: 150 pts, >7K views: 225 pts, >10K views: 300 pts)",
      monthBriefTheme: "Squad Up : Assemble Your Ultimate Crew with Google Gemini",
      briefHtml: 'Every month we drop a theme. You make a reel, post it, and <span class="font-bold bg-[linear-gradient(90deg,#EA4335,#FBBC04,#34A853)] bg-clip-text text-transparent">show the world</span> what Gemini can actually do.',
      forms: [
        { name: "Step 1 - Create & Share your Post", link: "https://taskpost.geministudentambassador.com/" }
      ],
      completion: {
        completed: false,
        reelUrl: "",
        reelViews: 0,
        linkedInPostUrl: "",
        proofDriveUrl: "",
        notes: ""
      }
    },
    {
      id: "monthly-highlights",
      title: "Monthly Highlights",
      type: "Booster Task",
      category: "Booster",
      pointsText: "200 Points fixed",
      minPoints: 200,
      maxPoints: 200,
      fixedPoints: 200,
      parameters: "1 Authenticated LinkedIn Post. 200 fixed upon authentication",
      briefHtml: 'Every month, post about your ambassador journey on LinkedIn — <span class="font-bold bg-[linear-gradient(90deg,#4285F4,#EA4335,#FBBC04,#34A853)] bg-clip-text text-transparent">your wins, your events, your growth</span>. Any format works: reel, static post, or carousel.',
      forms: [
        { name: "Share your monthly highlights post", link: "https://monthlyhighlights.geministudentambassador.com/" }
      ],
      completion: {
        completed: true,
        linkedInPostUrl: "",
        proofDriveUrl: "",
        postType: "Carousel & Event Photos",
        notes: ""
      }
    },
    {
      id: "product-understanding",
      title: "Product Understanding",
      type: "Mandatory Task",
      category: "Mandatory",
      pointsText: "Up to 750 Points",
      minPoints: 15,
      maxPoints: 750,
      pointsPerUnit: 15,
      unitName: "sessions",
      minUnits: 10,
      maxUnits: 50,
      parameters: "Maximum 50 participants, Minimum 10 participants, one-on-one session (15 pts per sessions)",
      briefHtml: 'Introduce a participant to Study Notebook, show them what it can do, and log their response by asking them to fill pre and post survey forms. Quick session, easy points',
      forms: [
        { name: "Pre - Survey", link: "https://productunderstandingpre.geministudentambassador.com/" },
        { name: "Post Survey", link: "https://productunderstandingpost.geministudentambassador.com/" },
        { name: "Video Submission Form", link: "https://productunderstanding.geministudentambassador.com" }
      ],
      completion: {
        completed: false,
        sessionsCount: 0,
        videoDriveUrl: "",
        preSurveyUrl: "",
        postSurveyUrl: "",
        notes: ""
      }
    },
    {
      id: "boost-google-initiatives",
      title: "Boost Google Initiatives",
      type: "Optional Task",
      category: "Booster",
      pointsText: "Variable Points",
      minPoints: 0,
      maxPoints: 500,
      comingSoon: true,
      parameters: "Ad-hoc campaigns and activations across India",
      briefHtml: 'Google runs year-round campaigns and activations across India — some planned, some sudden. Be ready to act fast, <span class="font-bold bg-[linear-gradient(90deg,#4285F4,#EA4335,#FBBC04,#34A853)] bg-clip-text text-transparent">create buzz</span>, and ensure Gemini stands out.',
      forms: [
        { name: "Submit Campaign Proof of Execution", link: "#" }
      ],
      completion: {
        completed: false,
        initiativeName: "",
        pointsClaimed: 0,
        proofDriveUrl: "",
        notes: ""
      }
    }
  ],

  // Official Resources
  resources: [
    {
      section: "1. Tutorials & Playbooks",
      links: [
        { label: "Google Drive Folder", name: "Study Notebook Tutorial Videos", url: "https://drive.google.com/drive/folders/1kMIfA74eTwhtdb3NXB0-6q7PD8BLxeGV", highlight: true },
        { label: "Program Playbook", name: "Program Guide", url: "https://drive.google.com/drive/folders/1vpwjhXdgt7I2Mc1cAy-64KXOyYNHxp4_?usp=drive_link" },
        { label: "Brand Playbook", name: "Google Gemini 2026 Playbook", url: "https://docs.google.com/presentation/d/1t1wCoRMuKK2jy8tGjXHHXTihwYkxZwIKroriZAv2TfU/edit?usp=sharing" },
        { label: "Task Guide", name: "November 2026 - Task Guide", url: "https://drive.google.com/open?id=1FHpR2p1dvjtAQ38RI82vccxc4KbqLycx" }
      ]
    },
    {
      section: "2. Official Survey & Feedback Forms",
      links: [
        { label: "Product Trials", name: "Step 1 – Pre-Survey Form", url: "https://producttrialsurvey.geministudentambassador.com/", highlight: true },
        { label: "Product Trials", name: "Step 4 – Participant Feedback Form", url: "https://producttrialfeedback.geministudentambassador.com/", highlight: true },
        { label: "Product Understanding", name: "Pre-Survey Form", url: "https://productunderstandingpre.geministudentambassador.com/", highlight: true },
        { label: "Product Understanding", name: "Post-Survey Form", url: "https://productunderstandingpost.geministudentambassador.com/", highlight: true },
        { label: "Product Understanding", name: "Video Submission Form", url: "https://productunderstanding.geministudentambassador.com" }
      ]
    },
    {
      section: "3. Brand Assets & Templates",
      links: [
        { label: "Logo Assets", name: "All GSA Logos (Google Drive)", url: "https://drive.google.com/drive/folders/1MlbJQMgm8CWpp03dKAgHeHCfbMnCMwYB?usp=drive_link", highlight: true },
        { label: "Certificate Template", name: "Certificates November", url: "https://drive.google.com/open?id=1Akh0qhg8GFboIsuipTa2ZT7pDwDrHwkg" },
        { label: "Task Collaterals", name: "Promotional Posters", url: "https://drive.google.com/open?id=1nLLP-MNpH8MqeYBvRhOq22luVwKWhoYi" }
      ]
    }
  ],

  // Logo Assets
  logoAssets: [
    { name: "Google Gemini Logo on White", path: "assets/google-gemini-logo-white.png", description: "Official primary branding for light surfaces", tag: "Primary Lockup" },
    { name: "Google Logo", path: "assets/google-logo.png", description: "Standard Google full-color mark", tag: "Wordmark" },
    { name: "Gemini Sparkle", path: "assets/gemini-sparkle.png", description: "Multi-color Gemini four-point sparkle", tag: "Brand Mark" },
    { name: "GSA Header Lockup", path: "assets/logo-04-header.png", description: "Google Gemini Student Ambassador header branding", tag: "Header Badge" },
    { name: "Logo 01", path: "assets/logo-01.png", description: "GSA emblem variant", tag: "Social Asset" },
    { name: "Logo 02", path: "assets/logo-02.png", description: "GSA horizontal banner lockup", tag: "Banner Asset" }
  ],

  leaderboard: []
};
