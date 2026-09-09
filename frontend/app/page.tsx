"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RecentLinks from "./components/RecentLinks";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUrlCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <Hero onUrlCreated={handleUrlCreated} />
      <RecentLinks refreshTrigger={refreshTrigger} />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}