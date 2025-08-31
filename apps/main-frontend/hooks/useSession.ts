import { getProfile } from "@/lib/api-client";
import { useEffect, useState } from "react";

type ProfileResponse = Awaited<ReturnType<typeof getProfile>>;

export const useSession = () => {
  const [user, setUser] = useState<null | ProfileResponse>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getProfile();
        setUser(userData?.user);
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
