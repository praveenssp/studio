import Link from "next/link";
import { Users } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import type { Room } from "@/lib/types";

type RoomCardProps = {
  room: Room & {
      participants: number;
      image?: ImagePlaceholder;
  }
};

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <Link href={`/rooms/${room.id}`} className="block">
      <Card className="bg-[#1c1c1c] p-4 rounded-xl transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg text-white">
        <CardHeader className="p-0">
          <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
          <CardDescription className="flex items-center text-sm text-gray-400">
             <Users className="h-4 w-4 mr-1" />
            {room.participants} active users
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
