"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from "@/components/shared/header";

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
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If there's a user, render the layout with its children
  return user ? (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  ) : null; // Or a fallback component if you prefer
}
