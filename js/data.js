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

  // Participant Session Information (For copy-pasting into Google Forms)
  participantSession: {
    workshopTheme: "Game On Night : Imagine The Impossible",
    sessionDate: "November 2026",
    toolUsed: "Google Gemini 1.5 Pro & Gemini Canvas",
    promptText: "Act as an innovative game concept designer. Create a unique campus game that blends physical exploration with real-time AI clues using Google Gemini. Outline the core rules, team scoring, and a 3-step interactive prototype plan.",
    productTrialPreSurvey: "https://producttrialsurvey.geministudentambassador.com/",
    productTrialFeedback: "https://producttrialfeedback.geministudentambassador.com/"
  },

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
      section: "2. Official Survey & Feedback Forms (Product Trials)",
      links: [
        { label: "Product Trials", name: "Step 1 – Pre-Survey Form", url: "https://producttrialsurvey.geministudentambassador.com/", highlight: true },
        { label: "Product Trials", name: "Step 4 – Participant Feedback Form", url: "https://producttrialfeedback.geministudentambassador.com/", highlight: true }
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
