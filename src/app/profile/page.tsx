import ProfileForm from "@/components/profile/profile-form";

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <ProfileForm />
    </div>
  );
}
