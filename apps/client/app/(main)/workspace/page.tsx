import Header from "components/global/header";
import { metadata } from "components/lib/page-metadata";

const Workspace = () => {
  return (
    <Header
      title={metadata.workspace.title}
      description={metadata.workspace.description}
    />
  );
};

export default Workspace;
