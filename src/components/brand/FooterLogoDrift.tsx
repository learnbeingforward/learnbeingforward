import { LogoIcon } from "./LogoIcon";

/**
 * A slow, ping-pong drift of the brand mark with a light sweep across the
 * wordmark — sits between the main footer content and the copyright bar.
 */
export function FooterLogoDrift() {
  return (
    <div className="overflow-hidden border-t border-white/10 py-7">
      <div className="flex items-center justify-center gap-3 motion-safe:animate-footer-logo-drift">
        <LogoIcon variant="white" className="size-8 shrink-0 opacity-80 sm:size-10" />
        <span
          className="bg-[linear-gradient(100deg,rgba(255,255,255,0.25)_0%,var(--color-gold-light)_45%,rgba(255,255,255,0.95)_55%,rgba(255,255,255,0.25)_100%)] bg-[length:250%_100%] bg-clip-text text-2xl font-semibold tracking-tight text-transparent motion-safe:animate-footer-logo-shine sm:text-3xl"
        >
          Learn Being Forward
        </span>
      </div>
    </div>
  );
}
