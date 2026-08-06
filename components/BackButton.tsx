"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label = "Back", fallbackHref = "/" }: { label?: string; fallbackHref?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        // If the user arrived here directly (no in-app history), history.length
        // is small — fall back to a known page instead of leaving the site.
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className="inline-flex items-center gap-1.5 text-sm text-paper/60 hover:text-paper transition mb-6"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}
