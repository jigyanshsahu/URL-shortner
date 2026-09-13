import RegisterForm from "../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#09090b] px-4 py-12 relative overflow-hidden">
      {/* 21st.dev ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.22),transparent)] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-30 pointer-events-none -z-10" />

      <RegisterForm />
    </main>
  );
}