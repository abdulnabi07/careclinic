"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    window.gtag?.("config", "G-ZD85N5VX6G", {
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
