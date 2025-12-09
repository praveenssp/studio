import { ArrowLeft } from "lucide-react";
import CreateRoomForm from "@/components/rooms/create-room-form";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function CreateRoomPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-2xl py-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rooms
        </Button>
      <h1 className="text-3xl font-bold mb-6">Create a New Room</h1>
      <CreateRoomForm />
    </div>
  );
}
