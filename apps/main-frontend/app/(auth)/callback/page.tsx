import Authorization from "@/components/global/auth/callback-authorization";
import React, { Suspense } from "react";

const CallbackPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading authorization...
        </div>
      }
    >
      <Authorization />
    </Suspense>
  );
};

export default CallbackPage;
