"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { cn } from "../lib/utils";
import { useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InputOTP, InputOTPSlot } from "components/ui/input-otp";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const { signUp, isLoaded, setActive } = useSignUp();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const authenticated = await signUp.create({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
        actionCompleteRedirectUrl: "/dashboard",
      });

      if (authenticated.status === "complete") {
        await setActive({ session: authenticated.createdSessionId });
        toast("Welcome back!", {
          description: "You have successfully logged in",
        });
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    try {
      const authenticated = await signUp.create({
        username: username,
        emailAddress: email,
        password: password,
      });

      signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setOtpGenerated(true);

      if (authenticated.status === "complete") {
        await setActive({ session: authenticated.createdSessionId });
        toast("Welcome", {
          description: "Account created successfully",
        });
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      if (error.errors[0].code === "form_password_incorrect") {
        toast("Invalid Credentials", {
          description: "The email/password you entered is incorrect",
        });
      }
      toast(error);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const completeSignUp = await signUp?.attemptEmailAddressVerification({
        code: otp,
      });

      if (completeSignUp?.status !== "complete") {
        toast("An error occured while verifying OTP", {
          description: "Please try again",
        });
      }

      if (completeSignUp?.status === "complete") {
        if (!completeSignUp.createdUserId) {
          return;
        }

        console.log(completeSignUp.createdUserId);
        //TODO: Add user to database

        setLoading(false);
        router.push("/dashboard");
      }

      // setActive(auth);
    } catch (error: any) {
      console.log(error);
      toast(error.errors[0].message, {
        description: "Something went wrong!",
      });
    }
  };

  if (otpGenerated) {
    return (
      <form
        className="flex flex-col justify-center items-center gap-6 w-full h-screen"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleVerify(e);
          }
        }}
        onSubmit={handleVerify}
      >
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(otp: string) => setOtp(otp)}
          onSubmit={handleVerify}
        >
          <div className="flex gap-3">
            <div>
              <InputOTPSlot index={0} />
            </div>
            <div>
              <InputOTPSlot index={1} />
            </div>
            <div>
              <InputOTPSlot index={2} />
            </div>
            <div>
              <InputOTPSlot index={3} />
            </div>
            <div>
              <InputOTPSlot index={4} />
            </div>
            <div>
              <InputOTPSlot index={5} />
            </div>
          </div>
        </InputOTP>
      </form>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSignIn}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Codex</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Codex</h1>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/sign-in" className="underline underline-offset-4">
                Sign in
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Prajwal"
                required
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or
            </span>
          </div>
          <div className="w-full">
            {/* <Button variant="outline" type="button" className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button> */}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              type="button"
              className="w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
