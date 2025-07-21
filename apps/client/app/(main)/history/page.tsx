import Header from "components/global/header";
import { metadata } from "components/lib/page-metadata";

const History = () => {
  return (
    <Header
      title={metadata.history.title}
      description={metadata.history.description}
    />
  );
};

export default History;
