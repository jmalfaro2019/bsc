import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Registrarse | Balanced Scorecard"
        description="Registrarse - Balanced Scorecard"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
