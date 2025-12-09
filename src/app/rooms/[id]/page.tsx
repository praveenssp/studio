import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import ChatControls from "@/components/chat/chat-controls";
import ParticipantCard from "@/components/chat/participant-card";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const participants = [
  { name: "Alice", avatar: PlaceHolderImages.find((img) => img.id === "avatar1"), isMuted: false, isSpeaking: true },
  { name: "Bob", avatar: PlaceHolderImages.find((img) => img.id === "avatar2"), isMuted: false, isSpeaking: false },
  { name: "Charlie", avatar: PlaceHolderImages.find((img) => img.id === "avatar3"), isMuted: true, isSpeaking: false },
  { name: "David", avatar: PlaceHolderImages.find((img) => img.id === "avatar4"), isMuted: false, isSpeaking: false },
  { name: "Eve", avatar: PlaceHolderImages.find((img) => img.id === "avatar5"), isMuted: false, isSpeaking: false },
  { name: "Frank", avatar: PlaceHolderImages.find((img) => img.id === "avatar6"), isMuted: true, isSpeaking: false },
];

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const roomName = "Chill & Chat"; // This would be fetched based on params.id

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Button variant="ghost" asChild className="-ml-4">
                <Link href="/rooms">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Rooms
                </Link>
            </Button>
            <h1 className="text-3xl font-bold">{roomName}</h1>
          </div>
          <div className="flex items-center text-lg text-muted-foreground gap-2">
            <Users className="h-6 w-6" />
            <span>{participants.length} Participants</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {participants.map((p, index) => (
            <ParticipantCard key={index} participant={p} />
          ))}
        </div>
      </div>
      <ChatControls />
    </div>
  );
}
