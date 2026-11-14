"use client";

import { signOut } from "next-auth/react";
import { Icon } from "./icons";

/** The circular navy "log out" icon button in the redesigned AppShell header —
 * same sign-out behavior as SignOutButton, different (icon-only) chrome. */
export function LogoutIconButton() {
  return (
    <button
      type="button"
      className="icon-btn-light"
      aria-label="Log out"
      onClick={() =>
        signOut({ redirect: false }).then(() => {
          window.location.href = "/auth";
        })
      }
    >
      <Icon name="logout" />
    </button>
  );
}
