import RegisterForm from "../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="relative flex h-screen max-h-screen w-full items-center justify-center bg-surface px-4 py-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-105 w-125rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-20 right-10 h-75 w-75 rounded-full bg-secondary/10 blur-[110px]" />
      <RegisterForm />
    </main>
  );
}