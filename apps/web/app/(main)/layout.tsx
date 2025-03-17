"use client";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "components/ui/sidebar";
import { AppSidebar } from "components/sidebar/app-sidebar";
import { useUser } from "@clerk/clerk-react";
import { Separator } from "components/ui/separator";
import Navbar from "components/global/navbar";
import { useRouter } from "next/navigation";

type SidebarProps = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: SidebarProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Navbar />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;
