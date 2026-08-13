/**
 * Declared rather than inferred, and `image` is explicitly optional.
 *
 * Without this, TypeScript reads the shape off the literal below: the moment
 * every entry happened to carry an `image`, it became a required field and
 * CVBuilder's "add project" — which creates a blank entry with no screenshot —
 * stopped type-checking. Adding or removing a screenshot should never change
 * the public type.
 */
export type Project = {
  id: string
  name: string
  shortDesc: string
  fullDesc: string
  tech: string[]
  github: string
  live: string
  featured: boolean
  category: string
  color: string
  image?: string
}

export const portfolioData = {
  personal: {
    name: "Md. Abdulla Al Mahmud",
    shortName: "Mahmud",
    fullName: "Md. Abdulla Al Mahmud",
    role: "Full-Stack Developer",
    tagline: "Building full-stack web applications with clean UI and real-world impact.",
    email: "mahmud.shamim.codes@gmail.com",
    phone: "+880 1963152981",
    location: "Dhaka, Bangladesh",
    github: "https://github.com/mahmudshamim",
    portfolio: "mahmud.dev",
    upwork: "https://www.upwork.com/freelancers/~019aac0b0b5967360a",
    linkedin: "https://www.linkedin.com/in/md-abdulla-al-mahmud/",
    summary:
      "Full-Stack Developer at Khulna Technologies LLC, specializing in React, Next.js, Node.js, and MongoDB. Background in UI/UX design and IT operations gives me a practical edge — I ship products that are fast, clean, and built for real users.",
    photo: "/images/mahmud-profile.jpg",
    available: true,
  },

  skills: [
    { name: "React",          level: 88, category: "Frontend", color: "#0f7f9e" },
    { name: "Next.js",        level: 85, category: "Frontend", color: "#e2701f" },
    { name: "Node.js",        level: 80, category: "Backend",  color: "#5b8f10" },
    { name: "MongoDB",        level: 78, category: "Backend",  color: "#2f8f5b" },
    { name: "JavaScript",     level: 88, category: "Frontend", color: "#b3730a" },
    { name: "TypeScript",     level: 75, category: "Frontend", color: "#e2701f" },
    { name: "Tailwind CSS",   level: 85, category: "Frontend", color: "#0f7f9e" },
    { name: "UI Design",      level: 88, category: "Design",   color: "#c9356b" },
    { name: "UX Design",      level: 84, category: "Design",   color: "#7a5bd6" },
    { name: "Figma",          level: 90, category: "Design",   color: "#b3730a" },
    { name: "Wireframing",    level: 82, category: "Design",   color: "#e2701f" },
    { name: "Prototyping",    level: 80, category: "Design",   color: "#e2701f" },
    { name: "Graphic Design", level: 78, category: "Design",   color: "#7a5bd6" },
    { name: "WordPress",      level: 82, category: "CMS",      color: "#e2701f" },
    { name: "AWS Amplify",    level: 68, category: "Backend",  color: "#b3730a" },
    { name: "GA4 Analytics",  level: 74, category: "Tools",    color: "#2f8f5b" },
    { name: "Monday.com",     level: 78, category: "Tools",    color: "#c9356b" },
    { name: "Cloudinary",     level: 70, category: "Backend",  color: "#e2701f" },
    { name: "React.js",       level: 88, category: "Frontend", color: "#0f7f9e" },
    { name: "Express",        level: 75, category: "Backend",  color: "#5b8f10" },
  ],

  // Separate "currently learning" flag for UI display
  currentlyLearning: [
    "React.js", "Tailwind CSS", "HTML/CSS Workflow", "Figma → Code", "Product Thinking"
  ],

  projects: [
    {
      id: "rajulaw",
      name: "Rajulaw",
      shortDesc: "Law firm website for Raju & Associates",
      fullDesc:
        "A professional law firm website for Raju & Associates. Clean, modern design with case inquiry, lawyer profiles, and practice area pages.",
      tech: ["Next.js", "React", "Tailwind CSS"],
      github: "",
      live: "https://rajulaw.com/",
      featured: true,
      category: "Full-Stack",
      color: "#9a7a1e",
      image: "/images/rajulaw.webp",
    },
    {
      id: "r-ramadhan",
      name: "R-Ramadhan",
      shortDesc: "Full-stack Ramadhan web application",
      fullDesc:
        "A full-stack Ramadhan web app built with React, Node.js, and MongoDB. Features prayer times, sehri/iftar countdowns, and user-friendly UI designed for the holy month.",
      tech: ["React", "Node.js", "MongoDB", "Vercel"],
      github: "",
      live: "https://ramadhan-web-app.vercel.app/",
      featured: true,
      category: "Full-Stack",
      color: "#2f8f5b",
      image: "/images/r-ramadhan.webp",
    },
    {
      id: "doctorgiri",
      name: "DoctorGiri",
      shortDesc: "Doctor appointment & healthcare platform",
      fullDesc:
        "A full-stack healthcare web application built with Next.js. Patients can find doctors, book appointments, and manage their health — designed with a clean, user-friendly interface.",
      tech: ["Next.js", "React", "Tailwind CSS"],
      github: "",
      live: "https://doctorgiri.com/",
      featured: true,
      category: "Full-Stack",
      color: "#2f8f5b",
      image: "/images/doctorgiri.webp",
    },
    {
      id: "examflow",
      name: "ExamFlow",
      shortDesc: "Online exam management system",
      fullDesc:
        "Exam platform for administering and marking assessments — admin panel, exam creation, user management, and result handling. Ships as AssessmentFlow under the KhulnaTech brand.",
      tech: ["Next.js", "React", "Node.js", "MongoDB"],
      github: "https://github.com/mahmudshamim",
      live: "https://examflow.khulnatech.us/login",
      featured: true,
      category: "Full-Stack",
      color: "#2f6fd0",
      image: "/images/examflow.webp",
    },

    /* `featured` orders the panel sequence rather than filtering it — flagged
       projects come first, everything else follows. Nothing is hidden.

       Descriptions and stacks below come from each live site (page title, meta
       description, and framework markers in the served HTML), not guesswork. */
    {
      id: "signingus",
      name: "SigningUs",
      shortDesc: "Digital signature platform — send, sign, and track documents",
      fullDesc:
        "E-signature SaaS. Draw, type, or upload a signature; multi-party ordered signing workflows, reusable templates, file collection, and a status dashboard. Delivery over email, WhatsApp, or link, with tiered plans and API access.",
      tech: ["Next.js", "React"],
      github: "",
      live: "https://signingus.com/",
      featured: true,
      category: "Full-Stack",
      color: "#2f6fd0",
      image: "/images/signingus.webp",
    },
    {
      id: "ouropero",
      name: "OurOpero",
      shortDesc: "Team workspace — boards, automation, and dashboards",
      fullDesc:
        "Project workspace combining boards, automation, dashboards, and team collaboration in one place. Positioned for fast-moving teams with data privacy as a first-class concern.",
      tech: ["Next.js", "React", "Vite"],
      github: "",
      live: "https://ouropero.com/",
      featured: false,
      category: "Full-Stack",
      color: "#7a5bd6",
      image: "/images/ouropero.webp",
    },
    {
      id: "ktl-subs",
      name: "KTL Subs",
      shortDesc: "Internal recurring-cost tracker for KhulnaTech",
      fullDesc:
        "Subscription management for KTL LLC and KTL LTD. Consolidates subscriptions, memberships, and licenses across entities with advance renewal alerts, yearly and monthly cost reporting, and paid-versus-used visibility. Owner-controlled accounts.",
      tech: ["Next.js", "React"],
      github: "",
      live: "https://subs.khulnatech.us/login",
      featured: false,
      category: "Full-Stack",
      color: "#2f8f5b",
      image: "/images/ktl-subs.webp",
    },
    {
      id: "diego-defense",
      name: "Diego Defense",
      shortDesc: "ITAR-compliant defense contractor site",
      fullDesc:
        "Corporate site for a U.S. defense contractor serving international sovereign procurement tenders. Covers procurement capabilities, ITAR compliance, and a vendor verification portal, structured around a four-step engagement flow.",
      tech: ["Next.js", "React"],
      github: "",
      live: "http://diegodefense.org/",
      featured: false,
      category: "Frontend",
      color: "#4b4941",
      image: "/images/diego-defense.webp",
    },
    {
      id: "seba-library",
      name: "Seba Bangla Library",
      shortDesc: "Nonprofit Bengali cultural library in Georgia",
      fullDesc:
        "Site for a Bengali cultural library and community centre founded in 2001. Book and DVD collections, events, photo gallery, membership, and donations.",
      tech: ["Next.js", "React"],
      github: "",
      live: "https://seba-library.vercel.app/",
      featured: false,
      category: "Frontend",
      color: "#9a7a1e",
      image: "/images/seba-library.webp",
    },
    {
      id: "terraexplore",
      name: "TerraExplore",
      shortDesc: "Expedition planner with itineraries and shared expenses",
      fullDesc:
        "Nature retreat planning app: visual itineraries, live maps, and shared group expense tracking. Plan, Explore, and Split are the three core flows.",
      tech: ["Next.js", "React"],
      github: "",
      live: "https://friends-tour.vercel.app/",
      featured: false,
      category: "Full-Stack",
      color: "#0f7f9e",
      image: "/images/terraexplore.webp",
    },
    {
      id: "porta-arsenale",
      name: "Porta Dell'Arsenale",
      shortDesc: "Venetian restaurant and wood-fired pizzeria",
      fullDesc:
        "Site for a ristorante and pizzeria in the historic Arsenale quarter of Venice — wood-fired oven, Venetian cooking, Adriatic seafood, and Neapolitan pizza, with table booking.",
      tech: ["Next.js", "React"],
      github: "",
      live: "https://portadellaarsenale.com/",
      featured: true,
      category: "Frontend",
      color: "#c9356b",
      image: "/images/porta-arsenale.webp",
    },
  ] as Project[],

  experience: [
    {
      role: "Web Developer",
      company: "Khulna Technologies LLC",
      date: "Aug 2024 — Present",
      desc: "Full-stack web development with Next.js 15+ · AWS Amplify & Vercel deployment · Cloudinary media integration · GA4 analytics setup · Monday.com workflow automation · HRM system support · Technical documentation.",
      current: true,
    },
    {
      role: "User Interface Designer",
      company: "Druto Soft",
      date: "Jan 2024 — Aug 2024",
      desc: "Full-time UI Designer at Druto Soft for 8 months. Designed user interfaces for software products — wireframes, high-fidelity screens, and design systems in Figma.",
      current: false,
    },
    {
      role: "Entrepreneur",
      company: "Chosma Gallery",
      date: "2022 — 2024",
      desc: "3 years of direct customer-facing experience in business operations. Developed deep understanding of user behavior, communication, and customer needs — a natural foundation for UX thinking.",
      current: false,
    },
  ],

  education: [
    {
      degree: "Complete Web Development — 6 Month Bootcamp (Batch WEB12)",
      school: "Programming Hero",
      date: "2025",
    },
    {
      degree: "UI/UX Graduation Program — 6 Month Course",
      school: "Ostad",
      date: "2024",
    },
    {
      degree: "Master of Business Administration (MBA) — Accounting",
      school: "Shamsur Rahman College, Gosairhat, Shariatpur",
      date: "2022 — 2023",
    },
    {
      degree: "Bachelor of Business Administration (BBA)",
      school: "National University, Bangladesh",
      date: "2015 — 2020",
    },
  ],

  languages: [
    { name: "Bangla",  level: 100 },
    { name: "English", level: 55  },
  ],

  reference: {
    name: "Habibur Rahman",
    title: "Mobile Application Developer (Android & iOS) | Flutter | Dart | REST API",
    phone: "+880 1684-208275",
  },
}
