"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import ProfileForm from "@/components/profile/profile-form";
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading profile...</p>
            </div>
        );
    }
    
  return (
    <div className="container mx-auto max-w-2xl py-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Button asChild>
                <Link href="/inbox">
                    <Inbox className="mr-2 h-4 w-4" />
                    Inbox
                </Link>
            </Button>
        </div>
      <ProfileForm />
    </div>
  );
}
