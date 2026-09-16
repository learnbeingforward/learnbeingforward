import type { IconType } from "react-icons";
import {
  SiC,
  SiCplusplus,
  SiPython,
  SiSharp,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiAngular,
  SiVuedotjs,
  SiNodedotjs,
  SiDjango,
  SiSpringboot,
  SiDotnet,
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiGit,
  SiGithub,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiNumpy,
  SiPandas,
  SiScikitlearn,
  SiDocker,
  SiArduino,
  SiRaspberrypi,
} from "react-icons/si";
import { FaJava, FaBrain, FaComments, FaUsers, FaFileAlt, FaCalculator, FaRobot } from "react-icons/fa";

export type Technology = {
  slug: string;
  name: string;
  icon: IconType;
  category:
    | "Languages"
    | "Frontend"
    | "Backend"
    | "Databases"
    | "Tools & DevOps"
    | "Aptitude"
    | "Soft Skills"
    | "Data & AI"
    | "Robotics";
};

export const technologies: Technology[] = [
  { slug: "c", name: "C", icon: SiC, category: "Languages" },
  { slug: "cpp", name: "C++", icon: SiCplusplus, category: "Languages" },
  { slug: "java", name: "Java", icon: FaJava, category: "Languages" },
  { slug: "python", name: "Python", icon: SiPython, category: "Languages" },
  { slug: "csharp", name: "C#", icon: SiSharp, category: "Languages" },
  { slug: "javascript", name: "JavaScript", icon: SiJavascript, category: "Languages" },
  { slug: "typescript", name: "TypeScript", icon: SiTypescript, category: "Languages" },

  { slug: "html5", name: "HTML5", icon: SiHtml5, category: "Frontend" },
  { slug: "css3", name: "CSS3", icon: SiCss, category: "Frontend" },
  { slug: "tailwind", name: "Tailwind CSS", icon: SiTailwindcss, category: "Frontend" },
  { slug: "react", name: "React", icon: SiReact, category: "Frontend" },
  { slug: "angular", name: "Angular", icon: SiAngular, category: "Frontend" },
  { slug: "vue", name: "Vue.js", icon: SiVuedotjs, category: "Frontend" },

  { slug: "nodejs", name: "Node.js", icon: SiNodedotjs, category: "Backend" },
  { slug: "django", name: "Django", icon: SiDjango, category: "Backend" },
  { slug: "spring-boot", name: "Spring Boot", icon: SiSpringboot, category: "Backend" },
  { slug: "dotnet", name: ".NET", icon: SiDotnet, category: "Backend" },

  { slug: "mysql", name: "MySQL / SQL", icon: SiMysql, category: "Databases" },
  { slug: "postgresql", name: "PostgreSQL", icon: SiPostgresql, category: "Databases" },
  { slug: "mongodb", name: "MongoDB", icon: SiMongodb, category: "Databases" },

  { slug: "git", name: "Git", icon: SiGit, category: "Tools & DevOps" },
  { slug: "github", name: "GitHub", icon: SiGithub, category: "Tools & DevOps" },
  { slug: "docker", name: "Docker", icon: SiDocker, category: "Tools & DevOps" },

  { slug: "quant-aptitude", name: "Quantitative Aptitude", icon: FaCalculator, category: "Aptitude" },
  { slug: "logical-reasoning", name: "Logical Reasoning", icon: FaBrain, category: "Aptitude" },
  { slug: "verbal-reasoning", name: "Verbal Reasoning", icon: FaComments, category: "Aptitude" },
  { slug: "nonverbal-reasoning", name: "Non-Verbal Reasoning", icon: FaBrain, category: "Aptitude" },

  { slug: "communication", name: "Communication", icon: FaComments, category: "Soft Skills" },
  { slug: "group-discussion", name: "Group Discussion", icon: FaUsers, category: "Soft Skills" },
  { slug: "interview-prep", name: "Interview Preparation", icon: FaUsers, category: "Soft Skills" },
  { slug: "resume-building", name: "Resume Building", icon: FaFileAlt, category: "Soft Skills" },

  { slug: "numpy", name: "NumPy", icon: SiNumpy, category: "Data & AI" },
  { slug: "pandas", name: "Pandas", icon: SiPandas, category: "Data & AI" },
  { slug: "scikit-learn", name: "scikit-learn", icon: SiScikitlearn, category: "Data & AI" },

  { slug: "robotics-fundamentals", name: "Robotics Fundamentals", icon: FaRobot, category: "Robotics" },
  { slug: "arduino", name: "Arduino", icon: SiArduino, category: "Robotics" },
  { slug: "raspberry-pi", name: "Raspberry Pi", icon: SiRaspberrypi, category: "Robotics" },
];

/** Subset used for the homepage marquee — recognizable core stack logos. */
export const marqueeTechnologies = technologies.filter((t) =>
  [
    "c",
    "cpp",
    "java",
    "python",
    "csharp",
    "javascript",
    "react",
    "angular",
    "vue",
    "nodejs",
    "django",
    "spring-boot",
    "dotnet",
    "mysql",
    "mongodb",
    "git",
  ].includes(t.slug)
);

export function getTechBySlug(slug: string) {
  return technologies.find((t) => t.slug === slug);
}

export function getTechsBySlugs(slugs: string[]) {
  return slugs.map(getTechBySlug).filter((t): t is Technology => Boolean(t));
}

export const technologyCategories = [
  "Languages",
  "Frontend",
  "Backend",
  "Databases",
  "Tools & DevOps",
  "Data & AI",
  "Aptitude",
  "Soft Skills",
  "Robotics",
] as const;
