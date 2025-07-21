import Header from "components/global/header";
import { metadata } from "components/lib/page-metadata";

const Favorites = () => {
  return (
    <Header
      title={metadata.favorites.title}
      description={metadata.favorites.description}
    />
  );
};

export default Favorites;
