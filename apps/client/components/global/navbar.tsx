import { useState } from "react";
import { Input } from "../ui/input";
import { Bell, Book, Search } from "lucide-react";
import { Tooltip, TooltipProvider } from "../ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";

const Navbar = () => {
  const [search, setSearch] = useState("");
  return (
    <div className="flex items-center justify-between w-full top-0 sticky backdrop-blur-md ">
      <div className="relative pt-1 ">
        <Input
          size={15}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full pl-10 pr-6"
          placeholder="Search..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              console.log(search);
            }
          }}
        />
        <Search
          size={25}
          className="absolute text-muted-foreground top-6 left-2 transform -translate-y-1/2"
        />
      </div>
      <div className="flex items-center gap-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Bell size={20} />
            </TooltipTrigger>
            <TooltipContent>
              <p className="p-2 text-xs border rounded-md dark:bg-black ">
                Notifications
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Book size={20} />
            </TooltipTrigger>
            <TooltipContent>
              <p className="p-2 text-xs border rounded-md dark:bg-black">
                Guide
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Navbar;
