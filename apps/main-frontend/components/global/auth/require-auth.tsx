"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type RequireAuthProps = {
  children: React.ReactNode;
};

/**
 * Minimal client-side auth guard.
 * - Checks for presence of "auth-token" in localStorage
 * - Redirects to /sign-in if absent
 * - Avoids SSR access to localStorage
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const router = useRouter();
  const [allowed, setAllowed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Ensure this only runs on client
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
      if (!token) {
        setAllowed(false);
        router.replace("/sign-in");
        return;
      }
      setAllowed(true);
    } catch {
      setAllowed(false);
      router.replace("/sign-in");
    }
  }, [router]);

  if (allowed === null) {
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Checking session...
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
};

export default RequireAuth;
