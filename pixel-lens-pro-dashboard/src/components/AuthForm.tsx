import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { setAuthUser } from "@/lib/auth";

type AuthMode = "login" | "signup";

const authSchema = z
  .object({
    mode: z.enum(["login", "signup"]),
    name: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.mode !== "signup") return;

    if (!v.name || !v.name.trim()) {
      ctx.addIssue({ code: "custom", path: ["name"], message: "Name is required" });
    }
    if (!v.confirmPassword || v.confirmPassword.length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Password must be at least 6 characters",
      });
      return;
    }
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

type AuthFormValues = z.infer<typeof authSchema>;

function FieldLabel({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[#e4e4e7]">
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="text-xs text-red-400">{message}</div>;
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isSignup = mode === "signup";
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: isSignup
      ? { mode: "signup", name: "", email: "", password: "", confirmPassword: "" }
      : { mode: "login", email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: AuthFormValues) => {
    setSubmitError(null);

    try {
      const name =
        values.mode === "signup"
          ? (values.name ?? "").trim()
          : (values.email.split("@")[0] ?? "User");

      setAuthUser({ name: name || "User", email: values.email });
      await navigate({ to: "/" });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117] px-4">
      <Card className="w-full max-w-[380px] rounded-[12px] border-[#27272a] bg-[#18181b] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-2xl font-semibold text-[#e4e4e7]">
            {isSignup ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-sm text-[#a1a1aa]">
            {isSignup
              ? "Start tracking design QA results in one place."
              : "Sign in to your PixelLens dashboard."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {isSignup ? (
              <div className="space-y-2">
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Your name"
                  className="border-[#27272a] bg-[#0f0f1a] text-[#e4e4e7] placeholder:text-[#52525b] focus-visible:border-[#818cf8] focus-visible:ring-0"
                  {...register("name")}
                />
                <FieldError message={errors.name?.message} />
              </div>
            ) : null}

            <div className="space-y-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="border-[#27272a] bg-[#0f0f1a] text-[#e4e4e7] placeholder:text-[#52525b] focus-visible:border-[#818cf8] focus-visible:ring-0"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="••••••••"
                className="border-[#27272a] bg-[#0f0f1a] text-[#e4e4e7] placeholder:text-[#52525b] focus-visible:border-[#818cf8] focus-visible:ring-0"
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>

            {isSignup ? (
              <div className="space-y-2">
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="border-[#27272a] bg-[#0f0f1a] text-[#e4e4e7] placeholder:text-[#52525b] focus-visible:border-[#818cf8] focus-visible:ring-0"
                  {...register("confirmPassword")}
                />
                <FieldError message={errors.confirmPassword?.message} />
              </div>
            ) : null}

            {submitError ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {submitError}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full rounded-[8px] bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white shadow hover:opacity-95"
            >
              {isSignup ? "Sign Up" : "Login"}
            </Button>

            <div className="pt-1 text-center text-sm text-[#a1a1aa]">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-[#818cf8] hover:text-[#a5b4fc]">
                    Login
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="font-medium text-[#818cf8] hover:text-[#a5b4fc]">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
