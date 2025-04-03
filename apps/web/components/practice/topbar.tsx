"use client";

import { Button } from "components/ui/button";
import { Play, Upload } from "lucide-react";
import React, { FormEventHandler, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import useCodeStore from "components/lib/store";
import { runPracticeCode } from "app/actions/practice";
import { LANGUAGE_CONFIG } from "app/utils/constants";

const TopBar = () => {
  const {
    code,
    language,
    setLanguage,
    setOutput,
    resetOutput,
    setIsRunning,
    setError,
    resetError,
  } = useCodeStore();

  const handleValueChange = (value: string) => {
    console.log(value);
    setLanguage(value);
    resetOutput();
    resetError();
  };

  const handleCodeSubmit = async () => {
    setIsRunning(true);
    console.log(code);
    const {
      output,
      stderr,
      stdout,
      code: outputCode,
    } = await runPracticeCode(code, language);
    if (outputCode == 0) {
      setOutput(output);
    }
    if (outputCode == 1) {
      setError(stderr);
    }
    setIsRunning(false);
  };

  return (
    <div className="px-5 py-2 w-full flex items-center justify-between">
      <div>
        <Select defaultValue={language} onValueChange={handleValueChange}>
          <SelectTrigger className="w-[165px]">
            <SelectValue defaultValue={"Javascript"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.entries(LANGUAGE_CONFIG).map(([key, value]) => (
                <SelectItem key={key} value={value.id}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 cursor-pointer">
          <Upload className="h-6 w-6" />
          <span className="font-semibold">Share</span>
        </Button>
        <Button
          onClick={handleCodeSubmit}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 cursor-pointer"
        >
          <Play className="h-6 w-6" />
          <span className="font-semibold">Run</span>
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
