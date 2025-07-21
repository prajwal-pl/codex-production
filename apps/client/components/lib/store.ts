import { create } from "zustand";
import { persist } from "zustand/middleware";

type CodeState = {
  code: string;
  language: string;
  isRunning: boolean;
  output: string | null;
  error: string | null;
};

type CodeActions = {
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setOutput: (output: string) => void;
  resetOutput: () => void;
  resetCode: () => void;
  setError: (error: string) => void;
  resetError: () => void;
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
      error: null,

      setCode: (code: string) => set({ code }),
      setLanguage: (language: string) => set({ language }),
      setIsRunning: (isRunning: boolean) => set({ isRunning }),
      setOutput: (output: string) => set({ output, isRunning: false }),
      resetOutput: () => set({ output: null }),
      resetError: () => set({ error: null }),
      resetCode: () => set({ code: "" }),
      setError: (error: string) => set({ error }),
    }),
    {
      name: "code-storage",
      partialize: (state) => ({ code: state.code, language: state.language }),
    }
  )
);

export default useCodeStore;
