import { create } from "zustand";
import { persist } from "zustand/middleware";

type CodeState = {
  code: string;
  language: string;
  isRunning: boolean;
  output: string | null;
};

type CodeActions = {
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setOutput: (output: string) => void;
  resetOutput: () => void;
  resetCode: () => void;
};

const useCodeStore = create<
  CodeState & CodeActions,
  [["zustand/persist", { code: string; language: string }]]
>(
  persist(
    (set) => ({
      code: "",
      language: "javascript",
      isRunning: false,
      output: null,

      setCode: (code: string) => set({ code }),
      setLanguage: (language: string) => set({ language }),
      setIsRunning: (isRunning: boolean) => set({ isRunning }),
      setOutput: (output: string) => set({ output, isRunning: false }),
      resetOutput: () => set({ output: null }),
      resetCode: () => set({ code: "" }),
    }),
    {
      name: "code-storage",
      partialize: (state) => ({ code: state.code, language: state.language }),
    }
  )
);

export default useCodeStore;
