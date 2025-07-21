import Header from "components/global/header";
import { metadata } from "components/lib/page-metadata";

const Dashboard = () => {
  return (
    <Header
      title={metadata.dashboard.title}
      description={metadata.dashboard.description}
    />
  );
};

export default Dashboard;
