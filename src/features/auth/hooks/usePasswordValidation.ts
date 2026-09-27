import { useMemo } from "react";

export type PasswordValidation = {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
};

// Mirrors the API's password policy (PasswordRules.StrongPassword): 8+ characters, upper, lower, digit.
export const usePasswordValidation = (password: string) => {
  const validation = useMemo<PasswordValidation>(
    () => ({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
    }),
    [password]
  );

  const isValid = useMemo(
    () => Object.values(validation).every(Boolean),
    [validation]
  );

  return { validation, isValid };
};
