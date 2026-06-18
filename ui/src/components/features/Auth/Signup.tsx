import DynamicForm from "../../../shared/shared-components/DynamicForm";
import { signupFields } from "../../layout/form/fields/signup.field";
import { signupSchema } from "../../layout/form/schemas/signup.schema";


const SignupPage = () => {
  const handleSignup = async (
    values: any
  ) => {
    console.log(values);

    /*
    {
      userName:"",
      fullName:"",
      email:"",
      password:"",
      confirmPassword:""
    }
    */

    // call signup API
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <DynamicForm
        fields={signupFields}
        validationSchema={signupSchema}
        submitButtonText="Create Account"
        onSubmit={handleSignup}
      />
    </div>
  );
};

export default SignupPage;