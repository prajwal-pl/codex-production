import React from "react";

const EditorRouteLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="absolute inset-0 top-[var(--header-height)]">
            {children}
        </div>
    );
};

export default EditorRouteLayout;
