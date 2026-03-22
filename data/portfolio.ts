export const portfolioData = {
  personal: {
    name: "Mahmud",
    fullName: "Mahmud Shamim",
    role: "Web Developer · UI/UX Designer · Frontend Engineer",
    tagline: "Building full-stack web applications with clean UI and real-world impact.",
    email: "mahmud.shamim.codes@gmail.com",
    phone: "+880 1963152981",
    location: "Shariatpur District, Dhaka, Bangladesh",
    github: "https://github.com/mahmudshamim",
    portfolio: "mahmud.dev",
    upwork: "https://www.upwork.com/freelancers/~019aac0b0b5967360a",
    linkedin: "https://www.linkedin.com/in/md-abdulla-al-mahmud/",
    summary:
      "I'm Mahmud Shamim, a Web Developer with a UI/UX design background. I completed Programming Hero's 6-month Complete Web Development bootcamp and am currently working as a Web Developer at Khulna Technologies LLC — building full-stack apps with React, Next.js, Node.js, and MongoDB. My UI/UX training and 7 years of customer-facing experience mean I build things that are not just functional, but genuinely usable.",
    available: true,
  },

  skills: [
    // Core design skills — what he actually does well
    { name: "UI Design",       level: 88, category: "Design",    color: "#ff0088" },
    { name: "UX Design",       level: 84, category: "Design",    color: "#a78bfa" },
    { name: "Figma",           level: 90, category: "Design",    color: "#f24e1e" },
    { name: "Wireframing",     level: 82, category: "Design",    color: "#f59e0b" },
    { name: "Prototyping",     level: 80, category: "Design",    color: "#ff6b35" },
    { name: "Graphic Design",  level: 78, category: "Design",    color: "#31a8ff" },
    // Tech — working knowledge at job
    { name: "Next.js",         level: 72, category: "Frontend",  color: "#4f8ef7" },
    { name: "WordPress",       level: 82, category: "CMS",       color: "#21759b" },
    { name: "AWS Amplify",     level: 68, category: "Cloud",     color: "#ff9900" },
    { name: "GA4 Analytics",   level: 74, category: "Analytics", color: "#e37400" },
    { name: "Monday.com",      level: 78, category: "Management",color: "#ff3d57" },
    { name: "Cloudinary",      level: 70, category: "Cloud",     color: "#3448c5" },
    // Currently learning — honest levels
    { name: "React.js",        level: 55, category: "Learning",  color: "#61dafb" },
    { name: "Tailwind CSS",    level: 62, category: "Learning",  color: "#38bdf8" },
  ],

  // Separate "currently learning" flag for UI display
  currentlyLearning: [
    "React.js", "Tailwind CSS", "HTML/CSS Workflow", "Figma → Code", "Product Thinking"
  ],

  projects: [
    {
      id: "examflow",
      name: "ExamFlow",
      shortDesc: "Full-stack Online Exam Management System",
      fullDesc:
        "A full-stack exam platform — Next.js, Node.js, MongoDB. Admin panel, exam creation, user management, result handling. Deployed on Vercel.",
      tech: ["Next.js", "Node.js", "MongoDB", "Vercel"],
      github: "https://github.com/mahmudshamim",
      live: "",
      featured: true,
      category: "Full-Stack",
      color: "#4f8ef7",
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
      color: "#34d399",
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
      color: "#34d399",
    },
  ],

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
