import { cn } from "components/lib/utils";
import { Button } from "components/ui/button";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { useSignUp } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { InputOTP, InputOTPSlot } from "../ui/input-otp";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress: email,
        password: password,
        username: username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setOtpGenerated(true);
    } catch (error: any) {
      toast(error.errors[0].message, {
        description: "An error occured while generating OTP",
      });
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
        navigate("/dashboard");
      }

      // setActive(auth);
    } catch (error: any) {
      console.log(error);
      toast(error.errors[0].message, {
        description: "Something went wrong!",
      });
    }
  };

  if (!isLoaded || loading) {
    return (
      <div>
        <Loader2 className="animate-spin flex items-center justify-center h-screen" />
      </div>
    );
  }

  if (otpGenerated) {
    return (
      <form
        className="flex flex-col gap-6 w-full h-screen"
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

  if (!otpGenerated) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>
              Enter your email below to sign up to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    onChange={(e: any) => setUsername(e.target.value)}
                    id="username"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    onChange={(e: any) => setEmail(e.target.value)}
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    id="password"
                    type="password"
                    required
                  />
                </div>
                <Button onClick={handleSubmit} type="submit" className="w-full">
                  Register
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <a href="/sign-in" className="underline underline-offset-4">
                  Sign In
                </a>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="clerk-captcha"></div>
      </div>
    );
  }
}
