import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="CREATE ACCOUNT"
      title="Start controlling cost."
      subtitle="Create your COSTERA workspace to connect POS, recipes, inventory and delivery data."
      visualTitle="One clear view of cost, stock and variance."
      visualText="Set up your restaurant workspace in under a minute."
    >
      <RegisterForm />
    </AuthShell>
  );
}
