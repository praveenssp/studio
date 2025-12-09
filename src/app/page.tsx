
import AuthForm from "@/components/auth/auth-form";
import Logo from "@/components/shared/logo";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center p-6 bg-gradient-auth">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
