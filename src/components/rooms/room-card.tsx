import Link from "next/link";
import { Users } from "lucide-react";
import {
  Card
} from "@/components/ui/card";
import type { Room } from "@/lib/types";
import Image from "next/image";

type RoomCardProps = {
  room: Room & {
      participants: number;
      imageUrl?: string;
  }
};

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <Link href={`/rooms/${room.id}`} className="block group">
      <Card className="bg-card p-3 rounded-xl transition-colors duration-200 ease-in-out group-hover:bg-card/80 text-white flex items-center gap-4">
        {room.imageUrl && (
            <div className="relative h-16 w-16 flex-shrink-0">
                 <Image src={room.imageUrl} alt={room.name} layout="fill" objectFit="cover" className="rounded-md" />
            </div>
        )}
        <div className="flex-grow overflow-hidden">
          <h3 className="text-base font-bold truncate">{room.name}</h3>
          {room.description && <p className="text-sm text-gray-400 truncate">{room.description}</p>}
          <div className="flex items-center text-xs text-gray-400 pt-1">
             <Users className="h-3 w-3 mr-1.5" />
            {room.participants} active users
          </div>
        </div>
      </Card>
    </Link>
  );
}
