// PLACEHOLDER DATA — replace with real employee/trainer profiles, photos, and CVs.
export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  experienceYears: number;
  background: string;
  specialties: string[];
  isFreelancer: boolean;
  colleges?: string[];
  avatarSeed: string;
  cvUrl: string;
};

export const teamMembers: TeamMember[] = [
  {
    slug: "pavan-kumar",
    name: "Pavan Kumar",
    role: "Founder & Lead Trainer",
    experienceYears: 8,
    background: "Full-stack development, placement training, curriculum design",
    specialties: ["Java", "Full-Stack Dev", "Placement Prep", "Curriculum Design"],
    isFreelancer: false,
    avatarSeed: "pavan-kumar",
    cvUrl: "/cv/placeholder-cv.pdf",
  },
  {
    slug: "ananya-rao",
    name: "Ananya Rao",
    role: "Senior Full-Stack Trainer",
    experienceYears: 6,
    background: "MERN stack, cloud deployment, technical mentorship",
    specialties: ["React", "Node.js", "MongoDB", "AWS"],
    isFreelancer: false,
    avatarSeed: "ananya-rao",
    cvUrl: "/cv/placeholder-cv.pdf",
  },
  {
    slug: "chidananda-k",
    name: "Chidananda K",
    role: "Soft Skills Trainer",
    experienceYears: 10,
    background: "Communication coaching, group discussions, interview preparation",
    specialties: ["Communication", "GD", "Interview Prep"],
    isFreelancer: true,
    colleges: ["RV College of Engineering", "PES University", "BMS College of Engineering"],
    avatarSeed: "chidananda-k",
    cvUrl: "/cv/placeholder-cv.pdf",
  },
  {
    slug: "sumitra-s",
    name: "Sumitra S",
    role: "Aptitude Trainer",
    experienceYears: 9,
    background: "Quantitative aptitude, logical reasoning, placement test prep",
    specialties: ["Quant Aptitude", "Logical Reasoning", "Test Strategy"],
    isFreelancer: true,
    colleges: ["Christ University", "Jain University"],
    avatarSeed: "sumitra-s",
    cvUrl: "/cv/placeholder-cv.pdf",
  },
  {
    slug: "arjun-mehta",
    name: "Arjun Mehta",
    role: "Backend Development Trainer",
    experienceYears: 5,
    background: "Java/Spring Boot backend systems, API design, databases",
    specialties: ["Java", "Spring Boot", "SQL", "REST APIs"],
    isFreelancer: false,
    avatarSeed: "arjun-mehta",
    cvUrl: "/cv/placeholder-cv.pdf",
  },
  {
    slug: "priya-nair",
    name: "Priya Nair",
    role: "Data Science Trainer",
    experienceYears: 4,
    background: "Python, statistics, and applied machine learning training",
    specialties: ["Python", "Pandas", "scikit-learn", "Statistics"],
    isFreelancer: true,
    colleges: ["Dayananda Sagar College of Engineering", "MVJ College of Engineering"],
    avatarSeed: "priya-nair",
    cvUrl: "/cv/placeholder-cv.pdf",
  },
  {
    slug: "karthik-iyer",
    name: "Karthik Iyer",
    role: "DSA & Coding Trainer",
    experienceYears: 7,
    background: "Competitive programming coach and DSA interview trainer",
    specialties: ["DSA", "C++", "Java", "Coding Interviews"],
    isFreelancer: false,
    avatarSeed: "karthik-iyer",
    cvUrl: "/cv/placeholder-cv.pdf",
  },
];
