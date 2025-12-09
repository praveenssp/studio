'use client';

import { ArrowLeft } from "lucide-react";
import CreateRoomForm from "@/components/rooms/create-room-form";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function CreateRoomPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      <main className="flex-1 container mx-auto max-w-2xl py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4 text-white hover:bg-white/20 hover:text-white">
              <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold">Create a New Room</h1>
        </div>
        <CreateRoomForm />
      </main>
    </div>
  );
}
