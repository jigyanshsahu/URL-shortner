"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthInput from "./AuthInput";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginFormValues,

    validators: {
      onSubmit: loginSchema,
    },

    onSubmit: async () => {
      setAuthStatus("Signing in...");
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAuthStatus("Welcome back! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 700);
    },
  });

  function handleGuestLogin() {
    setAuthStatus("Logging in as Guest...");
    setTimeout(() => {
      router.push("/");
    }, 600);
  }

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
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Sign in to manage your shortened URLs and analytics.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        {authStatus && (
          <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3 text-center text-xs font-medium text-indigo-300">
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
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            )}
          </form.Subscribe>

          {/* Divider */}
          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-600 font-medium">OR</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Guest / Demo Login */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950/80 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            <span>⚡</span>
            Continue as Guest
          </button>
        </form>
      </div>

      {/* Register & Navigation */}
      <p className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-400 hover:underline hover:text-indigo-300"
        >
          Create an account
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