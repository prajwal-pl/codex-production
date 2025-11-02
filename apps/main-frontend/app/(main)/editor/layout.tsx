import React from "react";
import RequireAuth from "@/components/global/auth/require-auth";

const EditorRouteLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <RequireAuth>
            <div className="absolute inset-0 top-[var(--header-height)]">
                {children}
            </div>
        </RequireAuth>
    );
};

export default EditorRouteLayout;
