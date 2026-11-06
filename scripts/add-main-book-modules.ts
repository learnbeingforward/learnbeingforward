import fs from "node:fs";
import path from "node:path";
import { prisma } from "../src/lib/prisma";

const SOURCE_DIR = "L:\\MY COMPANY (LBF)\\My Books and Content\\Main Books";
const DEST_DIR = path.join(process.cwd(), "public", "uploads", "course-content", "main-books");

type NewModule = {
  title: string;
  level?: string;
  topics: string[];
  techSlugs: string[];
  delivery: string;
  trackTitle?: string;
  sourcePdf: string;
  pdfTitle: string;
};

type ExistingModuleAttachment = {
  courseSlug: string;
  moduleTitle: string;
  sourcePdf: string;
  pdfTitle: string;
};

const PROGRAMMING_MODULES: NewModule[] = [
  {
    title: "C Programming",
    level: "Complete Course",
    topics: [
      "Syntax, variables & data types",
      "Control flow & functions",
      "Pointers & memory management",
      "Arrays, strings & structures",
      "File handling & standard library",
    ],
    techSlugs: ["c"],
    delivery: "Hands-on labs building console programs from scratch, with a focus on memory and pointers.",
    sourcePdf: "LBF_C_Programming_Complete_Notes.pdf",
    pdfTitle: "C Programming — Complete Notes",
  },
  {
    title: "C++ Programming",
    level: "Complete Course",
    topics: [
      "C++ fundamentals & OOP",
      "Classes, inheritance & polymorphism",
      "STL — containers & algorithms",
      "Templates & generic programming",
      "Memory management & smart pointers",
    ],
    techSlugs: ["cpp"],
    delivery: "Project-based labs covering both procedural and object-oriented C++.",
    sourcePdf: "LBF_CPP_Programming_Complete_Notes.pdf",
    pdfTitle: "C++ Programming — Complete Notes",
  },
  {
    title: "C# Programming",
    level: "Complete Course",
    topics: [
      "C# syntax & .NET basics",
      "OOP in C#",
      "Collections & LINQ",
      "Exception handling & delegates",
      "Building console & basic .NET apps",
    ],
    techSlugs: ["csharp"],
    delivery: "Guided exercises building toward a small .NET console application.",
    sourcePdf: "LBF_CSharp_Programming_Complete_Notes.pdf",
    pdfTitle: "C# Programming — Complete Notes",
  },
  {
    title: "Java Programming",
    level: "Complete Course",
    topics: [
      "Core Java syntax & OOP",
      "Collections framework",
      "Exception handling & I/O",
      "Multithreading basics",
      "Building a capstone console app",
    ],
    techSlugs: ["java"],
    delivery: "A complete language walkthrough with hands-on coding exercises end to end.",
    sourcePdf: "LBF_Java_Complete_Notes.pdf",
    pdfTitle: "Java Programming — Complete Notes",
  },
  {
    title: "JavaScript Programming",
    level: "Complete Course",
    topics: [
      "JS fundamentals & ES6+ syntax",
      "Functions, closures & scope",
      "DOM manipulation & events",
      "Asynchronous JS — promises & async/await",
      "Working with APIs & JSON",
    ],
    techSlugs: ["javascript"],
    delivery: "Interactive coding labs building small browser-based projects.",
    sourcePdf: "LBF_JavaScript_Programming_Complete_Notes.pdf",
    pdfTitle: "JavaScript Programming — Complete Notes",
  },
  {
    title: "Python Programming",
    level: "Complete Course",
    topics: [
      "Python syntax & data types",
      "Control flow & functions",
      "Data structures — lists, dicts, sets",
      "OOP in Python",
      "File handling & standard library",
    ],
    techSlugs: ["python"],
    delivery: "Hands-on scripting exercises from day one, building toward small automation projects.",
    sourcePdf: "LBF_Python_Programming_Complete_Notes.pdf",
    pdfTitle: "Python Programming — Complete Notes",
  },
  {
    title: "TypeScript Programming",
    level: "Complete Course",
    topics: [
      "TypeScript fundamentals & type system",
      "Interfaces & type aliases",
      "Generics",
      "Classes & OOP in TypeScript",
      "Working with JS libraries in a typed codebase",
    ],
    techSlugs: ["typescript"],
    delivery: "Guided labs converting and building typed applications on top of JavaScript basics.",
    sourcePdf: "LBF_TypeScript_Programming_Complete_Notes.pdf",
    pdfTitle: "TypeScript Programming — Complete Notes",
  },
];

const FRONTEND_MODULES: NewModule[] = [
  {
    title: "HTML",
    topics: [
      "Document structure & semantic tags",
      "Forms & input elements",
      "Accessibility basics",
      "Tables, media & embeds",
      "SEO-friendly markup",
    ],
    techSlugs: ["html5"],
    delivery: "Hands-on labs building real page structures from scratch.",
    sourcePdf: "LBF_HTML5_Complete_Notes.pdf",
    pdfTitle: "HTML5 — Complete Notes",
  },
  {
    title: "CSS",
    topics: [
      "Selectors, specificity & the box model",
      "Flexbox & Grid layout",
      "Responsive design & media queries",
      "Animations & transitions",
      "CSS variables & modern features",
    ],
    techSlugs: ["css3"],
    delivery: "Pixel-matching exercises recreating real UI designs.",
    sourcePdf: "LBF_CSS3_Complete_Notes.pdf",
    pdfTitle: "CSS3 — Complete Notes",
  },
  {
    title: "React",
    topics: [
      "Components, props & JSX",
      "State & the component lifecycle",
      "Hooks — useState, useEffect & custom hooks",
      "Routing & data fetching",
      "State management patterns",
    ],
    techSlugs: ["react"],
    delivery: "Project-based labs building a multi-page React application.",
    sourcePdf: "LBF_React_Complete_Notes.pdf",
    pdfTitle: "React — Complete Notes",
  },
  {
    title: "Vue",
    topics: [
      "Vue fundamentals & the template syntax",
      "Reactivity & the Composition API",
      "Components & props",
      "Vue Router basics",
      "State management with Pinia",
    ],
    techSlugs: ["vue"],
    delivery: "Hands-on labs building a small Vue single-page application.",
    sourcePdf: "LBF_Vue_Complete_Notes.pdf",
    pdfTitle: "Vue — Complete Notes",
  },
  {
    title: "TailwindCSS",
    topics: [
      "Utility-first fundamentals",
      "Responsive & state variants",
      "Customizing the design system",
      "Components & reusable patterns",
      "Dark mode & theming",
    ],
    techSlugs: ["tailwind"],
    delivery: "Rebuild real UI components using utility classes end to end.",
    sourcePdf: "LBF_TailwindCSS_Complete_Notes.pdf",
    pdfTitle: "TailwindCSS — Complete Notes",
  },
];

const ROBOTICS_MODULES: NewModule[] = [
  {
    title: "Arduino",
    topics: [
      "Arduino IDE & board basics",
      "Digital & analog I/O",
      "Sensors & actuators",
      "Serial communication",
      "Building a complete mini-project",
    ],
    techSlugs: ["arduino"],
    delivery: "Hardware labs — wiring, programming, and debugging real circuits.",
    sourcePdf: "LBF_Arduino_Complete_Notes.pdf",
    pdfTitle: "Arduino — Complete Notes",
  },
  {
    title: "Raspberry Pi",
    topics: [
      "Raspberry Pi setup & GPIO basics",
      "Python for hardware control",
      "Sensors, cameras & peripherals",
      "Networking & remote access",
      "Building a complete mini-project",
    ],
    techSlugs: ["raspberry-pi"],
    delivery: "Hardware labs building a complete Raspberry Pi project end to end.",
    sourcePdf: "LBF_Raspberry_Pi_Complete_Notes.pdf",
    pdfTitle: "Raspberry Pi — Complete Notes",
  },
];

const EXISTING_MODULE_ATTACHMENTS: ExistingModuleAttachment[] = [
  {
    courseSlug: "robotics",
    moduleTitle: "Fundamentals of Robotics",
    sourcePdf: "LBF_Robotics_Fundamentals_Complete_Notes.pdf",
    pdfTitle: "Robotics Fundamentals — Complete Notes",
  },
  {
    courseSlug: "quantitative-aptitude",
    moduleTitle: "Quantitative Aptitude",
    sourcePdf: "LBF_Quantitative_Aptitude_Complete_Notes.pdf",
    pdfTitle: "Quantitative Aptitude — Complete Notes",
  },
  {
    courseSlug: "logical-reasoning",
    moduleTitle: "Logical Reasoning",
    sourcePdf: "LBF_Logical_Reasoning_Complete_Notes.pdf",
    pdfTitle: "Logical Reasoning — Complete Notes",
  },
  {
    courseSlug: "verbal-reasoning",
    moduleTitle: "Verbal Reasoning",
    sourcePdf: "LBF_Verbal_Reasoning_Complete_Notes.pdf",
    pdfTitle: "Verbal Reasoning — Complete Notes",
  },
  {
    courseSlug: "non-verbal-reasoning",
    moduleTitle: "Non-Verbal Reasoning",
    sourcePdf: "LBF_NonVerbal_Reasoning_Complete_Notes.pdf",
    pdfTitle: "Non-Verbal Reasoning — Complete Notes",
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function copyPdf(sourceFileName: string): string {
  // Derive the destination name from the (already-unique) source filename rather than
  // slugifying the module title — "C Programming"/"C++ Programming"/"C# Programming" all
  // slugify to the same "c-programming" string, which silently overwrote files on disk.
  const destFileName = slugify(path.basename(sourceFileName, ".pdf")) + ".pdf";
  const destPath = path.join(DEST_DIR, destFileName);
  const publicUrl = `/uploads/course-content/main-books/${destFileName}`;

  // These PDFs are committed to git, so on a fresh deploy (Hostinger clones the repo
  // fresh every time, and has no access to the author's local L: drive) the file is
  // already present at destPath — nothing to copy. This is what makes this script safe
  // to run as part of the automated production build, not just locally.
  if (fs.existsSync(destPath)) {
    return publicUrl;
  }

  fs.mkdirSync(DEST_DIR, { recursive: true });
  const sourcePath = path.join(SOURCE_DIR, sourceFileName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source PDF not found at ${sourcePath}, and no existing file at ${destPath}.`);
  }
  fs.copyFileSync(sourcePath, destPath);
  return publicUrl;
}

async function createModulesForCourse(courseSlug: string, modules: NewModule[]) {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) throw new Error(`Course not found: ${courseSlug}`);

  for (const mod of modules) {
    const existing = await prisma.courseModule.findFirst({
      where: { courseId: course.id, title: mod.title },
    });
    if (existing) {
      console.log(`  skip (exists): ${course.name} > ${mod.title}`);
      continue;
    }

    const fileUrl = copyPdf(mod.sourcePdf);

    const maxOrder = await prisma.courseModule.aggregate({
      where: { courseId: course.id },
      _max: { order: true },
    });

    const created = await prisma.courseModule.create({
      data: {
        courseId: course.id,
        trackTitle: mod.trackTitle ?? "Course Modules",
        title: mod.title,
        level: mod.level ?? null,
        topics: JSON.stringify(mod.topics),
        techSlugs: JSON.stringify(mod.techSlugs),
        delivery: mod.delivery,
        order: (maxOrder._max.order ?? 0) + 1,
        mainPdfTitle: mod.pdfTitle,
        mainPdfUrl: fileUrl,
      },
    });

    for (const [i, title] of mod.topics.entries()) {
      await prisma.courseSubModule.create({
        data: { courseModuleId: created.id, title, order: i },
      });
    }

    console.log(`  created: ${course.name} > ${mod.title} (PDF: ${fileUrl})`);
  }
}

async function attachToExistingModules(attachments: ExistingModuleAttachment[]) {
  for (const att of attachments) {
    const courseModule = await prisma.courseModule.findFirst({
      where: { title: att.moduleTitle, course: { slug: att.courseSlug } },
    });
    if (!courseModule) {
      console.warn(`  WARNING: module not found for ${att.courseSlug} > ${att.moduleTitle}, skipping`);
      continue;
    }
    if (courseModule.mainPdfUrl) {
      console.log(`  skip (already has PDF): ${att.courseSlug} > ${att.moduleTitle}`);
      continue;
    }

    const fileUrl = copyPdf(att.sourcePdf);

    await prisma.courseModule.update({
      where: { id: courseModule.id },
      data: { mainPdfTitle: att.pdfTitle, mainPdfUrl: fileUrl },
    });

    console.log(`  attached: ${att.courseSlug} > ${att.moduleTitle} (PDF: ${fileUrl})`);
  }
}

async function ensureProgrammingCourse() {
  const existing = await prisma.course.findUnique({ where: { slug: "programming" } });
  if (existing) {
    console.log("Programming course already exists, reusing it.");
    return;
  }

  const maxOrder = await prisma.course.aggregate({ _max: { order: true } });
  await prisma.course.create({
    data: {
      slug: "programming",
      name: "Programming",
      shortDescription: "Deep-dive, language-by-language programming courses — C, C++, C#, Java, JavaScript, Python, and TypeScript.",
      description:
        "A dedicated course for students who want to go deep on a specific programming language, independent of any larger track. Each module below covers one language end-to-end, with its own complete reference book alongside the guided topic syllabus.",
      category: "Programming",
      techSlugs: JSON.stringify(["c", "cpp", "csharp", "java", "javascript", "python", "typescript"]),
      isPlaceholder: false,
      order: (maxOrder._max.order ?? 0) + 1,
      domain: "TECHNICAL",
    },
  });
  console.log("Created Programming course.");
}

async function unflagRoboticsPlaceholder() {
  const robotics = await prisma.course.findUnique({ where: { slug: "robotics" } });
  if (!robotics || !robotics.isPlaceholder) return;

  await prisma.course.update({
    where: { id: robotics.id },
    data: {
      isPlaceholder: false,
      description:
        "Foundations of robotics — sensors, actuators, and hands-on programming for both Arduino microcontrollers and Raspberry Pi single-board computers, each with a complete reference book alongside the guided curriculum.",
    },
  });
  console.log("Cleared placeholder flag on Robotics course.");
}

async function main() {
  console.log("=== Programming course ===");
  await ensureProgrammingCourse();
  await createModulesForCourse("programming", PROGRAMMING_MODULES);

  console.log("=== Frontend Development — new modules ===");
  await createModulesForCourse("frontend-development", FRONTEND_MODULES);

  console.log("=== Robotics — new modules ===");
  await createModulesForCourse("robotics", ROBOTICS_MODULES);
  await unflagRoboticsPlaceholder();

  console.log("=== Attaching PDFs to existing modules (Robotics Fundamentals + 4 Aptitude) ===");
  await attachToExistingModules(EXISTING_MODULE_ATTACHMENTS);

  console.log("Done.");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
