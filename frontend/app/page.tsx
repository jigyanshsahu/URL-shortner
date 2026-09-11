"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ArchitectureFlow from "./components/ArchitectureFlow";
import RecentLinks from "./components/RecentLinks";
import Features from "./components/Features";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import AnalyticsModal from "./components/AnalyticsModal";
import QrModal from "./components/QrModal";
import EditUrlModal from "./components/EditUrlModal";
import { ShortenedUrl } from "./lib/api";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [analyticsState, setAnalyticsState] = useState<{
    isOpen: boolean;
    shortCode: string;
    urlId: string | number | null;
  }>({
    isOpen: false,
    shortCode: "",
    urlId: null,
  });

  const [qrState, setQrState] = useState<{
    isOpen: boolean;
    shortCode: string;
    urlId: string | number | null;
  }>({
    isOpen: false,
    shortCode: "",
    urlId: null,
  });

  const [editState, setEditState] = useState<{
    isOpen: boolean;
    item: ShortenedUrl | null;
  }>({
    isOpen: false,
    item: null,
  });

  const handleUrlCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenAnalytics = (shortCode: string, id: string | number) => {
    setAnalyticsState({
      isOpen: true,
      shortCode,
      urlId: id,
    });
  };

  const handleOpenQr = (shortCode: string, id: string | number) => {
    setQrState({
      isOpen: true,
      shortCode,
      urlId: id,
    });
  };

  const handleOpenEdit = (item: ShortenedUrl) => {
    setEditState({
      isOpen: true,
      item,
    });
  };

  const handleUrlUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <Navbar />

      <Hero
        onUrlCreated={handleUrlCreated}
        onOpenQr={handleOpenQr}
        onOpenAnalytics={handleOpenAnalytics}
      />

      <ArchitectureFlow />

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold px-3 py-1 rounded-full bg-surface-container-high">
              LIVE DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-2">
              Recently Created Short Links
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Active routes being serviced by our Redis in-memory cache layer.
            </p>
          </div>
        </div>

        <RecentLinks
          refreshTrigger={refreshTrigger}
          onOpenAnalytics={handleOpenAnalytics}
          onOpenQr={handleOpenQr}
          onOpenEdit={handleOpenEdit}
        />
      </section>

      <Features />

      <CTA />

      <Footer />

      {/* Interactive Modals */}
      <AnalyticsModal
        isOpen={analyticsState.isOpen}
        onClose={() =>
          setAnalyticsState((prev) => ({ ...prev, isOpen: false }))
        }
        shortCode={analyticsState.shortCode}
        urlId={analyticsState.urlId}
      />

      <QrModal
        isOpen={qrState.isOpen}
        onClose={() => setQrState((prev) => ({ ...prev, isOpen: false }))}
        shortCode={qrState.shortCode}
        urlId={qrState.urlId}
      />

      <EditUrlModal
        isOpen={editState.isOpen}
        onClose={() => setEditState({ isOpen: false, item: null })}
        item={editState.item}
        onUpdated={handleUrlUpdated}
      />
    </main>
  );
}