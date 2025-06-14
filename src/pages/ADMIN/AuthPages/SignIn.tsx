import PageMeta from "../../../components/admin/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../../components/admin/auth/SignInForm.jsx";

export default function SignIn() {
  return (
    <>
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
