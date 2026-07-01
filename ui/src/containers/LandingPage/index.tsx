const LandingPage = () => {
  const ApplicationName = "TOMO";
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <img src="logo2.png" alt="Tomo" className="w-64 h-64" />

      <p className="text-lg text-center">
        Login or Signup to start using {ApplicationName} and connect with your
        friends!
      </p>
    </div>
  );
};

export default LandingPage;
