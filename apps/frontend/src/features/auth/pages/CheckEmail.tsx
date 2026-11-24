import { Mail } from "lucide-react";
import { AuthAlternateAction } from "@/features/auth/components/AuthAlternateAction";
import { AuthStatusPanel } from "@/features/auth/components/AuthStatusPanel";

const CheckEmail = () => {
  return (
    <AuthStatusPanel
      icon={Mail}
      title="Check your email"
      description="If an account matches that email, a password reset link will arrive shortly."
    >
      <AuthAlternateAction
        className="mt-0"
        message="Didn't receive it?"
        linkLabel="Try another email"
        to="/forgot-password"
      />

      <AuthAlternateAction
        className="mt-3"
        message="Remember your password?"
        linkLabel="Sign in"
        to="/login"
      />
    </AuthStatusPanel>
  );
};

export default CheckEmail;
