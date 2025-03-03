import Header from "components/global/header";
import { metadata } from "components/lib/page-metadata";

const Settings = () => {
  return (
    <Header
      title={metadata.settings.title}
      description={metadata.settings.description}
    />
  );
};

export default Settings;
