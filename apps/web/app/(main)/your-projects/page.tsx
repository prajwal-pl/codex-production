import Header from "components/global/header";
import { metadata } from "components/lib/page-metadata";

const YourProjects = () => {
  return (
    <Header
      title={metadata.yourProjects.title}
      description={metadata.yourProjects.description}
    />
  );
};

export default YourProjects;
