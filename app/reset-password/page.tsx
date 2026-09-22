import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/AuthForms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        eyebrow="RESET PASSWORD"
        title="Invalid reset link."
        subtitle="This password reset link is missing or malformed."
        visualTitle="Secure access, restored in minutes."
        visualText="Request a new reset link to continue."
      >
        <p className="auth-foot"><Link href="/forgot-password">Request a new link</Link></p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="RESET PASSWORD"
      title="Set a new password."
      subtitle="Choose a strong password to secure your COSTERA account."
      visualTitle="Secure access, restored in minutes."
      visualText="Your new password takes effect immediately."
    >
      <ResetForm token={token} />
    </AuthShell>
  );
}
