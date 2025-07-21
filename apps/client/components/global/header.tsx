type HeaderProps = {
  title: string;
  description: string;
};

const Header = ({ title, description }: HeaderProps) => {
  return (
    <div className="p-2 space-y-2">
      <h1 className="font-bold text-3xl">{title}</h1>
      <p className="text-muted-foreground font-normal">{description}</p>
    </div>
  );
};

export default Header;
