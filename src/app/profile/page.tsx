"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import ProfileForm from "@/components/profile/profile-form";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/shared/header';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-white">
                <p>Loading profile...</p>
            </div>
        );
    }
    
  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl py-8">
        <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4 text-white hover:bg-white/20 hover:text-white">
                <ArrowLeft />
            </Button>
            <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
        <ProfileForm />
      </main>
    </div>
  );
}
