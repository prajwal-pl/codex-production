import CodeEditor from "components/practice/code-editor";
import OutputPanel from "components/practice/output-panel";
import React from "react";
import TopBar from "./topbar";

const PracticeComponent = () => {
  return (
    <div>
      <TopBar />
      <div className="p-2 flex w-[100%] justify-center gap-6">
        <CodeEditor />
        <OutputPanel />
      </div>
    </div>
  );
};

export default PracticeComponent;
