import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateRoomForm from "@/components/rooms/create-room-form";
import { Button } from "@/components/ui/button";

export default function CreateRoomPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
       <Button variant="ghost" asChild className="mb-4">
        <Link href="/rooms">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Rooms
        </Link>
      </Button>
      <h1 className="text-3xl font-bold mb-6">Create a New Room</h1>
      <CreateRoomForm />
    </div>
  );
}
