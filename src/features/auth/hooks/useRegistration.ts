import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { register } from "@/features/auth/api";
import { useAuth } from "@/app/providers/useAuth";
import { getApiErrorMessage } from "@/lib/api/errors";

type RegistrationData = {
  fullName: string;
  email: string;
  password: string;
  majorId: number;
};

export const useRegistration = () => {
  const navigate = useNavigate();
  const { signInWithTokens } = useAuth();

  const handleRegistration = async (data: RegistrationData) => {
    try {
      const result = await register(data);

      // With email verification off the API signs the new user in straight away.
      if (result.tokens) {
        await signInWithTokens(result.tokens.accessToken, result.tokens.refreshToken);
        toast.success("Welcome to Uni-Hub!", {
          description: "Your account has been created successfully.",
          duration: 3000,
        });
        navigate("/");
        return;
      }

      toast.info("Check your email", {
        description: result.otpSent
          ? "We sent you a 6-digit code to verify your account."
          : "Request a verification code to finish creating your account.",
        duration: 5000,
      });
      navigate(`/auth/verify-account?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      const errorMessage = getApiErrorMessage(error, "Registration failed. Please try again.");

      toast.error("Registration failed", { description: errorMessage });
      throw error;
    }
  };

  return { handleRegistration };
};
