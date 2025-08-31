import { AuthForm } from "@/components/global/auth/auth-form";
import React from "react";

const SignInPage = () => {
  return <AuthForm alternateUrl="/sign-up" type="login" />;
};

export default SignInPage;
