import OtpForm from "@/components/auth/otp-form";
import Logo from "@/components/shared/logo";

export default function OtpPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <OtpForm />
      </div>
    </main>
  );
}
