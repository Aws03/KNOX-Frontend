export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  majorId: number;
}

/** POST /auth/register: tokens when the account can sign in now, otherwise a verification code was emailed. */
export interface RegisterResponse {
  requiresVerification: boolean;
  otpSent: boolean;
  tokens?: LoginResponse;
}

export interface VerifyAccountRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserInfoResponse {
  identityUserId: number;
  domainUserId: number;
  email: string;
  fullName: string;
  dateJoined: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  verificationDate?: string;
  profilePictureUrl?: string;
  universityId: number;
  universityName: string;
  facultyId: number;
  facultyName: string;
  majorId: number;
  majorName: string;
}
