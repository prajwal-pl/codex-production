type propTypes = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: propTypes) => {
  return (
    <div className="h-screen flex w-full justify-center">
      <div className="w-[600px] ld:w-full flex flex-col items-start p-6">
        <img
          src="/images/logo.png"
          alt="LOGO"
          sizes="100vw"
          style={{
            width: "20%",
            height: "auto",
          }}
          width={0}
          height={0}
        />
        {children}
      </div>
      <div className="hidden lg:flex flex-1 w-full max-h-full max-w-4000px overflow-hidden relative bg-cream flex-col pt-10 pl-24 gap-3">
        <h2 className="text-gravel md:text-4xl font-bold">
          Meet Axion, your AI powered project assistant
        </h2>
        <p className="text-iridium md:text-sm mb-10">
          Axion is capable of building your projects from scratch, with just a
          prompt.
          <br />
          Making your project management experience seamless and efficient.
        </p>
        <img
          src="/images/app-ui.png"
          alt="app image"
          loading="lazy"
          sizes="30"
          className="absolute shrink-0 !w-[1600px] top-48 border-4 border-cream rounded-xl"
          width={0}
          height={0}
        />
      </div>
    </div>
  );
};

export default AuthProvider;
