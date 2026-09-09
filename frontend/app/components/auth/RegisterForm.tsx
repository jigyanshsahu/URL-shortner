"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthInput from "./AuthInput";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
   email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies RegisterFormValues,

    validators: {
      onSubmit: registerSchema,
    },

    onSubmit: async () => {
      setAuthStatus("Creating your account...");
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAuthStatus("Account created! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 700);
    },
  });

  return (
    <div className="w-full max-w-md px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-extrabold text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 text-sm font-black text-white">
            S
          </span>
          <span>Shortly</span>
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Start creating and managing your short URLs today.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        {authStatus && (
          <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-center text-xs font-medium text-emerald-300">
            {authStatus}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Name */}
          <form.Field name="name">
            {(field) => (
              <AuthInput
                label="Full name"
                name="name"
                placeholder="John Doe"
                field={field}
              />
            )}
          </form.Field>

          {/* Email */}
          <form.Field name="email">
            {(field) => (
              <AuthInput
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                field={field}
              />
            )}
          </form.Field>

          {/* Password */}
          <form.Field name="password">
            {(field) => (
              <AuthInput
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                field={field}
              />
            )}
          </form.Field>

          {/* Confirm Password */}
          <form.Field name="confirmPassword">
            {(field) => (
              <AuthInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                field={field}
              />
            )}
          </form.Field>

          {/* Submit */}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-zinc-950 shadow-md transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            )}
          </form.Subscribe>
        </form>
      </div>

      {/* Login & Navigation */}
      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-400 hover:underline hover:text-indigo-300"
        >
          Sign in
        </Link>
      </p>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition inline-flex items-center gap-1"
        >
          <span>←</span>
          <span>Back to home</span>
        </Link>
      </div>
    </div>
  );
}