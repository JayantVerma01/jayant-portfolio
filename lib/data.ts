// ─── Portfolio Data ─────────────────────────────────────────────────────────

export const personalInfo = {
  name: "Jayant Verma",
  taglines: [
    "AI Full Stack Developer",
    "Next.js Developer",
    "Node.js Engineer",
    "React.js Developer",
    "AI Integration Expert",
  ],
  bio: "I'm a passionate Full Stack Developer with 1.5 years of experience building scalable web applications and AI-powered solutions. I specialize in crafting seamless user experiences with React.js and Next.js on the frontend, while architecting robust APIs and microservices with Node.js on the backend. I love exploring the intersection of web development and AI to create intelligent, user-centric products.",
  location: "Jaipur, Rajasthan, India",
  email: "vermajayant03@email.com",
  github: "https://github.com/JayantVerma01",
  linkedin: "https://linkedin.com/in/jayantverma1",
  resume: "/JAYANT VERMA RESUME.pdf",
  experienceYears: "1.5+",
  projectsCount: "10+",
  technologiesCount: "10+",
};

export const skills = [
  {
    category: "Backend",
    icon: "⚙️",
    color: "#8b5cf6",
    items: [
      { name: "Node.js", level: 90 },
      { name: "Express.js", level: 88 },
      { name: "REST APIs", level: 92 },
      { name: "FastAPI", level: 92 },
      { name: "JWT Authorization", level: 85 },
      { name: "RBAC", level: 80 }
    ],
  },
  {
    category: "Frontend",
    icon: "🖥️",
    color: "#6366f1",
    items: [
      { name: "Next.js", level: 92 },
      { name: "React.js", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "Tailwind CSS", level: 93 },
      { name: "Redux Toolkit", level: 75 },
      { name: "Hooks", level: 75 },
      { name: "SSR", level: 75 },
      { name: "SSG", level: 75 }
    ],
  },
  {
    category: "AI & LLM Technologies",
    icon: "🤖",
    color: "#06b6d4",
    items: [
      { name: "OpenAI API", level: 85 },
      { name: "LangChain", level: 72 },
      { name: "LangGraph", level: 72 },
      { name: "RAG", level: 88 },
      { name: "Vector Databases", level: 68 },
      { name: "AI Integration", level: 82 },
      { name: "Vision Pipeline", level: 82 },
    ],
  },
  {
    category: "Languages",
    icon: "🐍",
    color: "#ef4444",
    items: [
      { name: "JavaScript", level: 92 },
      { name: "TypeScript", level: 85 },
      { name: "SQL", level: 75 },
      { name: "Python", level: 88 },
    ],
  },
  {
    category: "Databases",
    icon: "🗄️",
    color: "#10b981",
    items: [
      { name: "MongoDB", level: 88 },
      { name: "MySQL", level: 75 },
      { name: "Chroma Vector DB", level: 85 },
      { name: "Vector Embeddings", level: 80 },
    ],
  },
  {
    category: "DevOps & Tools",
    icon: "🔧",
    color: "#f59e0b",
    items: [
      { name: "Git / GitHub", level: 92 },
      { name: "Docker", level: 92 },
      { name: "Docker Compose", level: 72 },
      { name: "GitHub Actions", level: 92 },
      { name: "Vercel / Netlify", level: 88 },
      { name: "AWS (EC2, S3, SES)", level: 70 },
      { name: "CI/CD", level: 68 },
    ],
  },
  {
    category: "TPS Integrations",
    icon: "🏭",
    color: "#2196f3",
    items: [
      { name: "SAP Integrations", level: 80 },
      { name: "Delhivery B2B & B2C", level: 85 },
      { name: "Razorpay", level: 80 },
      { name: "Shipmozo", level: 80 },
      { name: "Cloudinary", level: 80 },
      { name: "Resend", level: 75 }
    ],
  }
];

export const projects = [
  {
    id: 1,
    title: "Trade-Analyser AI",
    description:
      "Trade-Analyser AI is a web application that analyzes stock market data and provides insights to traders.",
    longDescription:
      "Trade-Analyser AI is a comprehensive stock market analysis platform that leverages AI-driven insights and visualizations to empower traders with actionable intelligence. The platform features advanced technical analysis tools, real-time market data, and intelligent pattern recognition to help users make informed trading decisions.",
    tech: ["FastAPI", "LangGraph", "LangChain", "Vision Pipeline", "RAG", "PostgreSQL", "Docker", "Next.js", "Node.js",],
    github: "https://github.com/JayantVerma01/Trade-Analyser",
    live: "https://trade-analyser-mu.vercel.app/",
    featured: true,
    category: "AI / ML",
    color: "#992b2b",
    stats: { commits: "30+", features: "15+" },
  },
  {
    id: 2,
    title: "All About Packing",
    description:
      "A full-featured e-commerce platform for packaging products with admin dashboard, inventory management, bulk discount system, coupon codes, payment integration, and real-time order tracking.",
    longDescription:
      "Built a complete e-commerce ecosystem with a customer-facing Next.js storefront and a separate admin dashboard. Features include inventory management, automated bulk discounts, coupon system, Razorpay payment integration, and AWS SES email notifications.",
    tech: ["Next.js", "Node.js", "MongoDB", "Express.js", "AWS S3", "Razorpay", "TypeScript"],
    github: "https://github.com/JayantVerma01",
    live: "https://allaboutpacking.com/",
    featured: true,
    category: "E-Commerce",
    color: "#6366f1",
    stats: { commits: "200+", features: "10+" },
  },
  {
    id: 3,
    title: "Buildsync",
    description:
      "BuildSync is a construction workflow platform that digitizes site operations like material, machine, RFI, gate entry, and approvals to improve tracking and coordination.",
    longDescription:
      "BuildSync is a full-stack construction management platform that streamlines material requests, machine allocation, RFI, gate entry, and procurement workflows with role-based access, tracking, dashboards, and mobile support.",
    tech: ["Next.js", "Node.js", "MongoDB", "Express.js", "AWS S3", "SAP Integration", "TypeScript"],
    github: "https://github.com/JayantVerma01",
    live: "https://web-uat.buildsync.net/",
    featured: true,
    category: "EPC",
    color: "#8b5cf6",
    stats: { commits: "1500+", features: "30+" },
  },
  {
    id: 4,
    title: "AI Powered Document Query System",
    description:
      "A RAG-based document search system using LangChain, OpenAI API, and vector embeddings to enable semantic search across enterprise documents.",
    longDescription:
      "A RAG-based document search system using LangChain, OpenAI API, and vector embeddings to enable semantic search across enterprise documents.",
    tech: ["Next.js", "OpenAI API", "LangChain", "TypeScript", "MongoDB", "Redis"],
    github: "https://github.com/JayantVerma01",
    live: "#",
    featured: true,
    category: "AI / ML",
    color: "#06b6d4",
    stats: { commits: "80+", features: "15+" },
  },
  {
    id: 5,
    title: "Bulk Mailer",
    description:
      "Mail service that sends bulk emails to the users.",
    longDescription:
      "A complete mail service that sends bulk emails to the users.",
    tech: ["Node.js", "Express.js", "HTML", "CSS", "NodeMailer", "JS"],
    github: "https://github.com/JayantVerma01/Mailer",
    live: "https://mailer-alpha-lime.vercel.app/",
    featured: true,
    category: "Web Application",
    color: "#80c04e",
    stats: { commits: "10+", features: "2+" },
  },
  {
    id:  6,
    title: "Naruto Jutsu AR",
    description: "A web application that uses MediaPipe Hands to track hand movements and render procedural visual effects.",
    longDescription: "A web application that uses MediaPipe Hands to track hand movements and render procedural visual effects. Features include Rasengan, Chidori, and projectile physics.",
    tech: ["HTML", "CSS", "JavaScript", "MediaPipe", "JS Utilities"],
    github: "https://github.com/JayantVerma01/naruto-jutsu-ar",
    live: "https://jayantverma01.github.io/naruto-jutsu-ar/",
    featured: true,
    category: "Web Application",
    color: "#f59e0b",
    stats: { commits: "10+", features: "5+" },

  },
  {
    id: 7,
    title: "DToC — Direct to Creator",
    description:
      "An NFT marketplace connecting digital creators directly with collectors. Features wallet integration, NFT minting, listing, bidding, and real-time transaction updates.",
    longDescription:
      "Full-stack NFT marketplace with MetaMask wallet integration, smart contract interactions, IPFS media storage, and a Redux-powered state management system for seamless user experience.",
    tech: ["Next.js", "Redux", "Node.js", "Solidity", "IPFS", "Web3.js", "MongoDB"],
    github: "https://github.com/jayantverma",
    live: "https://dtoc.io/",
    featured: true,
    category: "Blockchain",
    color: "#8b5cf6",
    stats: { commits: "120+", features: "20+" },
  },
  {
    id: 8,
    title: "Decentralized Voting System",
    description:
      "A blockchain-based voting platform ensuring transparency, immutability, and security for elections. Built on Ethereum with IPFS-stored voter credentials.",
    longDescription:
      "Implemented smart contracts in Solidity for tamper-proof vote recording. Admin panel for election management, voter registration, real-time vote counting, and full audit trail via blockchain.",
    tech: ["React.js", "Node.js", "Solidity", "Ethereum", "IPFS", "MongoDB", "Express.js"],
    github: "https://github.com/JayantVerma01/Decentralized-Voting-System",
    live: "https://github.com/JayantVerma01/Decentralized-Voting-System",
    featured: false,
    category: "Blockchain",
    color: "#10b981",
    stats: { commits: "90+", features: "12+" },
  },
  {
    id: 9,
    title: "Gemac HR Management",
    description:
      "Enterprise HR management system with employee onboarding, leave management, payroll processing, performance reviews, and role-based access control.",
    longDescription:
      "Built for a corporate client using React frontend and Node.js backend. Features include multi-role RBAC, automated payroll calculations, leave approval workflows, and comprehensive reporting.",
    tech: ["React", "Node.js", "MongoDB", "Express.js", "JWT Authorization", "RBAC"],
    github: "https://github.com/jayantverma",
    live: "https://hrtest.svojas.co/manage/login.aspx",
    featured: false,
    category: "Enterprise",
    color: "#ec4899",
    stats: { commits: "150+", features: "25+" },
  },
  {
    id: 10,
    title: "Cubicle",
    description:
      "Cubicle is a SaaS based tool that help to manage daily office work in just one click.",
    longDescription:
      "Cubicle is a SaaS based tool that help to manage daily office work in just one click.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "JWT", "Redux"],
    github: "#",
    live: "https://crm.cubicleweb.com/",
    featured: false,
    category: "Enterprise",
    color: "#0563eb",
    stats: { commits: "20+", features: "10+" },
  },
  {
    id: 11,
    title: "Azon Hub",
    description:
      "A full-stack e-commerce application with product catalog, cart management, user authentication, order processing, and admin product management.",
    longDescription:
      "MERN stack e-commerce app with JWT authentication, product filtering/sorting, shopping cart with persistence, Stripe payment integration, and a responsive admin dashboard.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Stripe", "JWT", "Redux"],
    github: "https://github.com/JayantVerma01/AZONHUB/tree/main/Azonhub",
    live: "https://github.com/JayantVerma01/AZONHUB/tree/main/Azonhub",
    featured: false,
    category: "E-Commerce",
    color: "#f59e0b",
    stats: { commits: "70+", features: "18+" },
  },
  {
    id: 12,
    title: "Pixteria",
    description:
      "Pixteria is a social media platform with real-time messaging, user authentication, image/video sharing, and profile management.",
    longDescription:
      "Pixteria is a full-stack social media platform with real-time messaging, image/video sharing, user authentication, profile management and many more features.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "JWT", "Redux"],
    github: "https://github.com/JayantVerma01/Pixteria",
    live: "https://github.com/JayantVerma01/Pixteria",
    featured: false,
    category: "Web Application",
    color: "#06b6d4",
    stats: { commits: "70+", features: "18+" },
  }
];

export const experience = [
  {
    id: 1,
    role: "Full Stack Developer",
    company: "HG Infra Engineering Ltd.",
    type: "Full-time",
    duration: "August 2025 — Present",
    current: true,
    description:
      "Working as a full-stack developer building enterprise web applications with React.js and Next.js. Responsible for designing scalable APIs, implementing RBAC systems, and delivering high-performance features.",
    achievements: [
      "Designed and developed RESTful APIs with Node.js",
      "Implemented role-based access control across multiple modules",
      "Optimized database queries improving performance by 40%",
      "Collaborated with cross-functional teams in Agile sprints",
    ],
    tech: ["React.js", "Next.js", "Node.js", "Express.js", "MongoDB", "JWT", "Redux", "AWS S3", "SAP Integration"],
    color: "#a27cf5ff",
  },
  {
    id: 2,
    role: "Backend Developer Trainee",
    company: "Hornet Dynamics",
    type: "Training",
    duration: "March 2025 — July 2025",
    current: false,
    description:
      "Working as a backend developer building enterprise web applications with Node.js and Express.js. Responsible for designing scalable APIs, implementing RBAC systems, and delivering high-performance features.",
    achievements: [
      "Designed and developed RESTful APIs with Node.js",
      "Implemented role-based access control across multiple modules",
      "Optimized database queries improving performance by 40%",
      "Collaborated with cross-functional teams in Agile sprints",
    ],
    tech: ["Node.js", "Express.js", "MySQL", "JWT", "Redux", "AWS S3"],
    color: "#6366f1",
  },
  {
    id: 3,
    role: "Backend Developer Intern",
    company: "Fixl Solutions",
    type: "Internship",
    duration: "July 2024 — November 2024",
    current: false,
    description:
      "Contributed to backend development of SaaS products using Node.js and Express.js. Built RESTful APIs, integrated third-party services, and worked on database schema design.",
    achievements: [
      "Built 15+ RESTful API endpoints for production applications",
      "Integrated payment gateway and email notification services",
      "Implemented JWT-based authentication and authorization",
      "Reduced API response times by 30% through query optimization",
    ],
    tech: ["Node.js", "Express.js", "MongoDB", "Redis", "JWT", "AWS SES"],
    color: "#8b5cf6",
  },
];

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];
