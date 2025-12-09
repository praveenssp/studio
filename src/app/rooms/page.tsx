import RoomCard from "@/components/rooms/room-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const rooms = [
  {
    id: "1",
    name: "Chill & Chat",
    description: "Relaxed conversations and good vibes.",
    participants: 12,
    image: PlaceHolderImages.find((img) => img.id === "room-background-1"),
  },
  {
    id: "2",
    name: "Tech Talk",
    description: "Discussing the latest in technology.",
    participants: 25,
    image: PlaceHolderImages.find((img) => img.id === "room-background-2"),
  },
  {
    id: "3",
    name: "Gaming Lobby",
    description: "Find teammates for your next match.",
    participants: 8,
    image: PlaceHolderImages.find((img) => img.id === "room-background-3"),
  },
  {
    id: "4",
    name: "Late Night Whispers",
    description: "For the night owls.",
    participants: 5,
    image: PlaceHolderImages.find((img) => img.id === "room-background-1"),
  },
    {
    id: "5",
    name: "Study Group",
    description: "Let's study together.",
    participants: 15,
    image: PlaceHolderImages.find((img) => img.id === "room-background-2"),
  },
    {
    id: "6",
    name: "Music Hangout",
    description: "Share and discover new music.",
    participants: 30,
    image: PlaceHolderImages.find((img) => img.id === "room-background-3"),
  },
];

export default function RoomsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Rooms</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
