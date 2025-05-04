"use client";

import React, { useState, useRef, useEffect } from "react";

const Terminal = () => {
  const [history, setHistory] = useState<string[]>([
    "Welcome to Codex Terminal",
    "Type 'help' for available commands"
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus on input when terminal is clicked
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Auto scroll to bottom when history changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  // Handle terminal commands
  const handleCommand = (cmd: string) => {
    // Add command to history
    const newHistory = [...history, `$ ${cmd}`];
    
    // Process command
    const command = cmd.trim().toLowerCase();
    
    if (command === "") {
      setHistory([...newHistory, ""]);
    } else if (command === "clear") {
      setHistory(["Terminal cleared"]);
    } else if (command === "help") {
      setHistory([
        ...newHistory,
        "Available commands:",
        "  help     - Show this help message",
        "  clear    - Clear terminal",
        "  date     - Show current date and time",
        "  echo     - Echo a message",
        "  ls       - List files (simulated)"
      ]);
    } else if (command === "date") {
      setHistory([
        ...newHistory,
        new Date().toLocaleString()
      ]);
    } else if (command.startsWith("echo ")) {
      const message = cmd.substring(5);
      setHistory([...newHistory, message]);
    } else if (command === "ls") {
      setHistory([
        ...newHistory,
        "index.js",
        "package.json",
        "README.md",
        "node_modules/",
        "src/",
        "public/"
      ]);
    } else {
      setHistory([
        ...newHistory,
        `Command not found: ${cmd}. Type 'help' for available commands.`
      ]);
    }

    // Add to command history for up/down navigation
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(currentInput);
      setCurrentInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    }
  };

  return (
    <div 
      className="h-full flex flex-col bg-black text-zinc-400 font-mono text-sm p-2"
      onClick={focusInput}
    >
      <div className="border-b border-zinc-800 pb-1 mb-2 text-xs flex justify-between">
        <span>Terminal</span>
        <span className="text-zinc-600">bash</span>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-auto whitespace-pre-wrap"
      >
        {history.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>

      <div className="flex items-center pt-1">
        <span className="mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-zinc-400"
          autoFocus
        />
      </div>
    </div>
  );
};

export default Terminal;
