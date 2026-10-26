import { UserRole } from "@prisma/client";
import "next-auth/jwt";

// Session/User types are now declared in src/auth.ts via declare module "next-auth"
// We only need JWT augmentation here
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
