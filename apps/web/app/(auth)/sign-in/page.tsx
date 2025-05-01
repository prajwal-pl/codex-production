"use client";

import React from "react";
import { useSignIn } from "@clerk/nextjs";
import { Button } from "components/ui/button";
import { LoginForm } from "components/global/login-form";

const SignIn = () => {
  const { isLoaded, setActive, signIn } = useSignIn();

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default SignIn;
