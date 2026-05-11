import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar Sesión | Balanced Scorecard"
        description="Iniciar sesión - Balanced Scorecard"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
