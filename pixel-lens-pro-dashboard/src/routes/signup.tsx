import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return <AuthForm mode="signup" />;
}
