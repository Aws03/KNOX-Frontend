import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { sendVerificationCode, verifyAccount } from "@/features/auth/api";
import { useAuth } from "@/app/providers/useAuth";
import { getApiErrorMessage } from "@/lib/api/errors";

// POST /auth/verify-account confirms the emailed code and returns tokens, so the user is signed in.
const VerifyAccountForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signInWithTokens } = useAuth();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const tokens = await verifyAccount({ email, otp });
      await signInWithTokens(tokens.accessToken, tokens.refreshToken);
      toast.success("Account verified", { description: "Welcome to Uni-Hub!" });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not verify the account. Check the code and try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsResending(true);
    try {
      await sendVerificationCode({ email });
      toast.success("Code sent", { description: `A new code is on its way to ${email}.` });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send a new code. Please try again later."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-1">
        <Label className="leading-5" htmlFor="verifyEmail">
          Email address*
        </Label>
        <Input
          type="email"
          id="verifyEmail"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1">
        <Label className="leading-5" htmlFor="verifyOtp">
          Verification code*
        </Label>
        <Input
          type="text"
          inputMode="numeric"
          id="verifyOtp"
          placeholder="Enter the 6-digit code from your email"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          maxLength={6}
          required
          disabled={isLoading}
        />
      </div>

      <Button className="w-full" type="submit" disabled={isLoading || otp.length !== 6}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify account"
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={handleResend}
        disabled={isResending || !email}
      >
        {isResending ? "Sending..." : "Send a new code"}
      </Button>
    </form>
  );
};

export default VerifyAccountForm;
