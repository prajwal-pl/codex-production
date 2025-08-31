"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

const Authorization = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      localStorage.setItem("auth-token", token);
      toast.success("Authorization successful");
      router.push("/dashboard");
    }
    if (!token) {
      toast.error("No authorization token found! Please try logging in again.");
      router.push("/sign-in");
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1>Authorization in progress</h1>
      <Loader2 size={24} className="animate-spin" />
    </div>
  );
};

export default Authorization;
