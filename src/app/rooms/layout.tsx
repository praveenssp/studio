"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

export default function RoomsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  // While loading, you can show a loader or a blank screen
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // If there's a user, render the layout with its children
  return user ? <>{children}</> : null; // Or a fallback component if you prefer
}
