"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

/**
 * Mounted once inside every LMS dashboard page via DashboardShell. Jobs:
 *
 * 1. Force a reload when this page is restored from the browser's back/forward
 *    cache (bfcache) — otherwise pressing Back after logging out can briefly
 *    show a stale snapshot of the authenticated page instead of re-checking
 *    the session with the server.
 * 2. Force a reload on any back/forward (popstate) navigation involving this
 *    page. Next.js's own client-side router cache can silently reuse a
 *    previously-fetched RSC payload for Back/Forward instead of asking the
 *    server again — the pageshow handler above only catches a true full-page
 *    bfcache restore, not this app-level cache, so Back could otherwise show
 *    a dashboard page without re-checking whether the session is still valid.
 * 3. Auto sign out after 5 minutes with no mouse/keyboard/scroll/touch activity.
 */
export function SessionGuard() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }
    function handlePopState() {
      window.location.reload();
    }
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        signOut({ redirect: false }).then(() => {
          window.location.href = "/auth?reason=timeout";
        });
      }, INACTIVITY_LIMIT_MS);
    }

    resetTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, []);

  return null;
}
