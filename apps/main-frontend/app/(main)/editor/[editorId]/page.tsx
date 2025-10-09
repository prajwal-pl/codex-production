import React from "react";

type EditorPageProps = {
  params: Promise<{ editorId: string }>
};

const EditorPage = ({ params }: EditorPageProps) => {
  const p = React.use(params);
  return <div>EditorPage: {p.editorId}</div>;
};

export default EditorPage;
