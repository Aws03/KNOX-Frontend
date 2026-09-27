import { apiClient } from "@/lib/api/apiClient";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  UserInfoResponse,
  VerifyAccountRequest,
} from "@/features/auth/types";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
}

// Token refresh lives in lib/api/apiClient.ts (refreshSession), shared by the interceptor and AuthProvider.

// Revokes this session's refresh token. Works with an expired access token: the refresh token is proof enough.
export async function logout(refreshToken?: string): Promise<void> {
  try {
    await apiClient.post("/auth/logout", refreshToken ? { refreshToken } : undefined);
  } catch (error) {
    console.error("Logout API call failed:", error);
  }
}

// Confirms the account with the emailed code and signs the user in (returns tokens).
export async function verifyAccount(data: VerifyAccountRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/verify-account", data);
  return response.data;
}

export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(
    "/auth/register",
    data
  );
  return response.data;
}

export async function getUserInfo(): Promise<UserInfoResponse> {
  const response = await apiClient.get<UserInfoResponse>("/users/me");
  return response.data;
}

// There's no dedicated /auth/forgot-password endpoint - send-verification-otp
// is the same generic "email an OTP to this address" mechanism the account
// verification flow uses, and it's what the reset-password flow relies on too.
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await apiClient.post("/auth/send-verification-otp", data);
}

// Same endpoint: emails a new code for verifying the account.
export const sendVerificationCode = forgotPassword;

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await apiClient.post("/auth/reset-password", data);
}

// Requires an authenticated session - apiClient's request interceptor attaches
// the access token automatically, same as every other authenticated call.
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.post("/auth/change-password", data);
}
