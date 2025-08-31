import { AuthForm } from "@/components/global/auth/auth-form";
import React from "react";

const SignUpPage = () => {
  return <AuthForm alternateUrl="/sign-in" type="signup" />;
};

export default SignUpPage;
