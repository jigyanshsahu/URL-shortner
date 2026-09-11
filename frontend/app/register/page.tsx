import RegisterForm from "../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-surface px-4 py-12 overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[500px] rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-20 right-10 h-[300px] w-[300px] rounded-full bg-secondary/10 blur-[110px]" />
      <RegisterForm />
    </main>
  );
}