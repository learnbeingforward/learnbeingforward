export type CourseModule = {
  title: string;
  level?: string;
  topics: string[];
  techSlugs: string[];
  delivery: string;
};

export type CourseTrack = {
  title: string;
  modules: CourseModule[];
};

export type Course = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  techSlugs: string[];
  tracks: CourseTrack[];
  isPlaceholder?: boolean;
};

export const courses: Course[] = [
  {
    slug: "placement-training-program",
    name: "Placement Training Program",
    shortDescription:
      "Our flagship, multi-track program combining programming, DSA, aptitude, and soft skills to get students placement-ready.",
    description:
      "The Placement Training Program is Learn Being Forward's flagship offering — a comprehensive, multi-track curriculum built directly from what we've seen students fall short on right before campus placements. It combines a full programming track, dedicated data structures & algorithms practice, aptitude training across all four reasoning areas, and soft-skills coaching for interviews and group discussions.",
    techSlugs: ["java", "python", "javascript", "mysql", "git"],
    tracks: [
      {
        title: "Programming Track",
        modules: [
          {
            title: "Java Fundamentals",
            level: "Fundamentals",
            topics: ["Syntax & data types", "Control flow", "OOP basics", "Arrays & strings", "Exception handling"],
            techSlugs: ["java"],
            delivery: "Guided coding labs with daily practice problems and instructor code review.",
          },
          {
            title: "Java Intermediate",
            level: "Intermediate",
            topics: ["Collections framework", "Generics", "Multithreading basics", "File I/O", "JDBC basics"],
            techSlugs: ["java", "mysql"],
            delivery: "Hands-on mini-projects with peer code reviews.",
          },
          {
            title: "Java Advanced",
            level: "Advanced",
            topics: ["Design patterns", "Streams & lambdas", "Advanced concurrency", "Building a capstone application"],
            techSlugs: ["java"],
            delivery: "Capstone project + mock technical interviews.",
          },
        ],
      },
      {
        title: "DSA Track",
        modules: [
          {
            title: "DSA Fundamentals",
            level: "Fundamentals",
            topics: ["Arrays & strings", "Linked lists", "Stacks & queues", "Recursion", "Time/space complexity"],
            techSlugs: ["java", "python"],
            delivery: "Daily problem sets with hands-on whiteboard-style walkthroughs.",
          },
          {
            title: "DSA Advanced",
            level: "Advanced",
            topics: ["Trees & graphs", "Dynamic programming", "Greedy algorithms", "Sorting/searching at scale", "Mock coding tests"],
            techSlugs: ["java", "python"],
            delivery: "Timed mock tests mirroring real placement coding rounds.",
          },
        ],
      },
      {
        title: "Aptitude Track",
        modules: [
          {
            title: "Quantitative Aptitude",
            topics: ["Number systems", "Percentages & ratios", "Time, speed & distance", "Profit & loss", "Data interpretation"],
            techSlugs: ["quant-aptitude"],
            delivery: "Timed practice sets with speed-solving techniques.",
          },
          {
            title: "Logical Reasoning",
            topics: ["Puzzles", "Seating arrangements", "Blood relations", "Syllogisms", "Coding-decoding"],
            techSlugs: ["logical-reasoning"],
            delivery: "Pattern-based drills and weekly mock tests.",
          },
          {
            title: "Verbal Reasoning",
            topics: ["Reading comprehension", "Sentence correction", "Vocabulary", "Critical reasoning"],
            techSlugs: ["verbal-reasoning"],
            delivery: "Passage-based practice with instructor feedback.",
          },
          {
            title: "Non-Verbal Reasoning",
            topics: ["Series completion", "Pattern recognition", "Mirror & water images", "Cubes & dice"],
            techSlugs: ["nonverbal-reasoning"],
            delivery: "Visual pattern drills and timed assessments.",
          },
        ],
      },
      {
        title: "Soft Skills Track",
        modules: [
          {
            title: "Communication",
            topics: ["Verbal & non-verbal communication", "Email & business writing", "Public speaking basics"],
            techSlugs: ["communication"],
            delivery: "Role-play sessions and recorded practice with feedback.",
          },
          {
            title: "Group Discussion",
            topics: ["GD structure & etiquette", "Forming arguments", "Handling disagreement", "Time management in GDs"],
            techSlugs: ["group-discussion"],
            delivery: "Simulated group discussions with peer and trainer evaluation.",
          },
          {
            title: "Interview Preparation",
            topics: ["HR interview questions", "Technical interview strategy", "Body language", "Salary negotiation basics"],
            techSlugs: ["interview-prep"],
            delivery: "One-on-one mock interviews with recorded feedback.",
          },
          {
            title: "Resume Building",
            topics: ["ATS-friendly formatting", "Highlighting projects", "Quantifying achievements", "LinkedIn optimization"],
            techSlugs: ["resume-building"],
            delivery: "Individual resume reviews and iteration rounds.",
          },
        ],
      },
    ],
  },
  {
    slug: "full-stack-development",
    name: "Full-Stack Development",
    shortDescription:
      "Everything needed to become a full-stack developer: frontend, backend, databases, and deployment — in one course.",
    description:
      "This course takes students from zero to shipping a complete web application, covering the frontend, backend, database, and deployment skills that real full-stack roles require. Every module is built around hands-on projects, not just theory.",
    techSlugs: ["react", "nodejs", "mongodb", "git", "docker"],
    tracks: [
      {
        title: "Course Modules",
        modules: [
          {
            title: "Frontend Module",
            topics: ["HTML/CSS fundamentals", "JavaScript & the DOM", "React component architecture", "State management", "Responsive UI"],
            techSlugs: ["html5", "css3", "javascript", "react"],
            delivery: "Project-based: build and iterate on a real UI across the module.",
          },
          {
            title: "Backend Module",
            topics: ["REST API design", "Authentication & authorization", "Middleware & error handling", "Server architecture basics"],
            techSlugs: ["nodejs"],
            delivery: "Build a production-style API with tests.",
          },
          {
            title: "Database Module",
            topics: ["Relational vs. NoSQL modeling", "Query design", "Indexing & performance basics", "ORMs"],
            techSlugs: ["mysql", "mongodb"],
            delivery: "Hands-on schema design and query workshops.",
          },
          {
            title: "Deployment & DevOps Module",
            topics: ["Git workflows", "Environment configuration", "Containerization basics", "CI/CD fundamentals", "Cloud deployment"],
            techSlugs: ["git", "docker"],
            delivery: "Deploy the capstone app to a live environment.",
          },
        ],
      },
    ],
  },
  {
    slug: "frontend-development",
    name: "Frontend Development",
    shortDescription: "A focused course on building modern, responsive, interactive user interfaces.",
    description:
      "A standalone course for students who want to specialize in frontend engineering — from markup and styling fundamentals through modern component frameworks and state management.",
    techSlugs: ["html5", "css3", "javascript", "react", "angular", "vue"],
    tracks: [
      {
        title: "Course Modules",
        modules: [
          {
            title: "HTML & CSS",
            topics: ["Semantic HTML", "Modern CSS & layout (Flexbox/Grid)", "Responsive design principles"],
            techSlugs: ["html5", "css3"],
            delivery: "Build pixel-accurate layouts from real design references.",
          },
          {
            title: "JavaScript",
            topics: ["Core JS fundamentals", "DOM manipulation", "Async JS & APIs", "ES6+ features"],
            techSlugs: ["javascript"],
            delivery: "Interactive coding labs and small app builds.",
          },
          {
            title: "React / Angular / Vue",
            topics: ["Component-driven architecture", "Routing", "State management", "Hooks & composition patterns"],
            techSlugs: ["react", "angular", "vue"],
            delivery: "Framework project sprint with code reviews.",
          },
          {
            title: "Responsive Design & State Management",
            topics: ["Mobile-first design", "Cross-browser testing", "Global vs. local state", "Performance basics"],
            techSlugs: ["react", "css3"],
            delivery: "Capstone responsive application with state management.",
          },
        ],
      },
    ],
  },
  {
    slug: "backend-development",
    name: "Backend Development",
    shortDescription: "Server-side engineering: APIs, databases, authentication, and deployment fundamentals.",
    description:
      "A standalone course for students specializing in backend engineering, covering server frameworks, REST API design, database integration, authentication, and the basics of shipping a service to production.",
    techSlugs: ["nodejs", "django", "spring-boot", "dotnet", "mysql"],
    tracks: [
      {
        title: "Course Modules",
        modules: [
          {
            title: "Server Frameworks",
            topics: ["Node.js / Django / Spring Boot / .NET fundamentals", "Project structure & routing", "Middleware"],
            techSlugs: ["nodejs", "django", "spring-boot", "dotnet"],
            delivery: "Build the same API in your chosen framework track.",
          },
          {
            title: "REST API Design",
            topics: ["Resource modeling", "Status codes & error handling", "Versioning", "API documentation"],
            techSlugs: ["nodejs"],
            delivery: "Design and document a real API contract.",
          },
          {
            title: "Databases",
            topics: ["Relational schema design", "Query optimization basics", "ORMs & migrations"],
            techSlugs: ["mysql", "mongodb"],
            delivery: "Hands-on database integration project.",
          },
          {
            title: "Authentication & Deployment",
            topics: ["Session vs. token auth", "Role-based access control", "Environment config", "Basic cloud deployment"],
            techSlugs: ["nodejs"],
            delivery: "Ship an authenticated API to a live environment.",
          },
        ],
      },
    ],
  },
  {
    slug: "data-science-ai-fundamentals",
    name: "Data Science / AI Fundamentals",
    shortDescription: "Python-based data science foundations, statistics, and an introduction to machine learning & AI.",
    description:
      "An introductory course for students exploring data science and AI — covering Python for data work, core statistics, machine learning fundamentals, and the essential libraries used in real data science workflows.",
    techSlugs: ["python", "numpy", "pandas", "scikit-learn"],
    tracks: [
      {
        title: "Course Modules",
        modules: [
          {
            title: "Python for Data Science",
            topics: ["Python fundamentals for data work", "Working with files & data formats", "Scripting for automation"],
            techSlugs: ["python"],
            delivery: "Hands-on notebooks with real datasets.",
          },
          {
            title: "Statistics Basics",
            topics: ["Descriptive statistics", "Probability fundamentals", "Distributions", "Hypothesis testing basics"],
            techSlugs: ["python"],
            delivery: "Applied exercises using real-world data.",
          },
          {
            title: "ML Fundamentals & Libraries",
            topics: ["Supervised vs. unsupervised learning", "Model evaluation basics", "NumPy & Pandas workflows", "scikit-learn pipelines"],
            techSlugs: ["numpy", "pandas", "scikit-learn"],
            delivery: "Build and evaluate a first ML model end-to-end.",
          },
          {
            title: "Intro to AI Concepts",
            topics: ["What machine learning and AI actually are", "Common AI application areas", "Responsible AI basics"],
            techSlugs: ["python"],
            delivery: "Guided discussion + capstone mini-project.",
          },
        ],
      },
    ],
  },
  {
    slug: "robotics",
    name: "Robotics",
    shortDescription: "Foundations of robotics: sensors, actuators, and programming for robots.",
    description:
      "PLACEHOLDER — TODO: replace with real curriculum. No specific syllabus was provided for this course yet; the outline below is a reasonable generic structure so this page isn't empty. Flagged for the client to review and replace.",
    techSlugs: ["arduino", "raspberry-pi", "robotics-fundamentals"],
    isPlaceholder: true,
    tracks: [
      {
        title: "Course Modules (placeholder)",
        modules: [
          {
            title: "Fundamentals of Robotics",
            level: "Placeholder",
            topics: ["Introduction to robotics systems", "Basic mechanics & kinematics", "Robotics safety basics"],
            techSlugs: ["robotics-fundamentals"],
            delivery: "PLACEHOLDER — hands-on lab exercises (TBD).",
          },
          {
            title: "Sensors & Actuators",
            level: "Placeholder",
            topics: ["Common sensor types", "Motors & actuators", "Reading sensor data"],
            techSlugs: ["arduino"],
            delivery: "PLACEHOLDER — hardware lab sessions (TBD).",
          },
          {
            title: "Programming for Robotics",
            level: "Placeholder",
            topics: ["Microcontroller programming (Arduino)", "Single-board computers (Raspberry Pi)", "Basic control loops"],
            techSlugs: ["arduino", "raspberry-pi"],
            delivery: "PLACEHOLDER — guided build project (TBD).",
          },
        ],
      },
    ],
  },
];

export function getCourseBySlug(slug: string) {
  return courses.find((c) => c.slug === slug);
}
