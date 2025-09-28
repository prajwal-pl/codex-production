import { getProfile, type ProfileResponse } from "@/lib/api-client";
import { useEffect, useState } from "react";

export const useSession = () => {
  type User = ProfileResponse["user"];
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getProfile();
        setUser(userData?.user ?? null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user")
        );
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};
