import type { DefaultSession } from "next-auth";

type AppRole = "STUDENT" | "COLLEGE_ADMIN" | "SUPER_ADMIN" | "TRAINER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      collegeId: string | null;
      trainerId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    collegeId?: string | null;
    trainerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    collegeId?: string | null;
    trainerId?: string | null;
  }
}
