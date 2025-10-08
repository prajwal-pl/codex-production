import React from "react";

type EditorPageProps = {
  params: { editorId: string };
};

const EditorPage = ({ params }: EditorPageProps) => {
  return <div>EditorPage: {params.editorId}</div>;
};

export default EditorPage;
