

const LoginPage = () => {
  const handleLogin = async (
    values: any
  ) => {
    console.log(values);

    /*
    {
      email:"test@gmail.com",
      password:"123456"
    }
    */

    // dispatch(login())
    // call login API
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <DynamicForm
        fields={loginFields}
        validationSchema={loginSchema}
        submitButtonText="Login"
        onSubmit={handleLogin}
      />
    </div>
  );
};

export default LoginPage;