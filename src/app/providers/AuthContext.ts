import { createContext } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  // Extended user details from /api/users/me
  identityUserId?: number;
  domainUserId?: number;
  fullName?: string;
  dateJoined?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  verificationDate?: string;
  profilePictureUrl?: string | null;
  universityId?: number;
  universityName?: string;
  facultyId?: number;
  facultyName?: string;
  majorId?: number;
  majorName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Starts a session from tokens the API already issued (registration, account verification). */
  signInWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
export type { User, AuthContextType };
