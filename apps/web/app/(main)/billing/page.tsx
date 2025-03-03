import Header from "components/global/header";
import { metadata } from "components/lib/page-metadata";

const Billing = () => {
  return (
    <Header
      title={metadata.billing.title}
      description={metadata.billing.description}
    />
  );
};

export default Billing;
