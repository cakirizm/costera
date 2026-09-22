import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/AuthForms";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="RESET PASSWORD"
      title="Forgot your password?"
      subtitle="Enter your work email and we'll send a link to reset your password."
      visualTitle="Secure access, restored in minutes."
      visualText="We'll email a one-time reset link valid for 30 minutes."
    >
      <ForgotForm />
    </AuthShell>
  );
}
