import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "components/ui/sidebar";
import { AppSidebar } from "../sidebar/app-sidebar";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { Separator } from "../ui/separator";
import Navbar from "./navbar";

const SidebarLayout = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  if (!isSignedIn) {
    navigate("/sign-in");
  }

  const active =
    location.pathname === "/editor" ||
    location.pathname === "/community" ||
    location.pathname === "/favorites" ||
    location.pathname === "/your-projects";
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> */}
            <Navbar />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;
