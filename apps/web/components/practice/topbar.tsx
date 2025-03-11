import { Button } from "components/ui/button";
import { Play, Upload } from "lucide-react";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

const TopBar = () => {
  return (
    <div className="px-5 py-2 w-full flex items-center justify-between">
      <div>
        <Select defaultValue="Javascript">
          <SelectTrigger className="w-[165px]">
            <SelectValue defaultValue={"Javascript"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Javascript">Javascript</SelectItem>
              <SelectItem value="Typescript">Typescript</SelectItem>
              <SelectItem value="Java">Java</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Rust">Rust</SelectItem>
              <SelectItem value="GoLang">GoLang</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="C++">C++</SelectItem>
              <SelectItem value="C#">C#</SelectItem>
              <SelectItem value="Ruby">Ruby</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 cursor-pointer">
          <Upload className="h-6 w-6" />
          <span className="font-semibold">Share</span>
        </Button>
        <Button className="bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 cursor-pointer">
          <Play className="h-6 w-6" />
          <span className="font-semibold">Run</span>
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
