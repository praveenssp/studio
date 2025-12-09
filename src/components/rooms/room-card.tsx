import Link from "next/link";
import { Users } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
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
      <Card className="bg-card rounded-xl transition-transform duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-lg text-white overflow-hidden">
        {room.imageUrl && (
            <div className="relative h-32 w-full">
                 <Image src={room.imageUrl} alt={room.name} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-black/30"></div>
            </div>
        )}
        <CardHeader className="p-4">
          <CardTitle className="text-base font-bold truncate">{room.name}</CardTitle>
          <CardDescription className="flex items-center text-xs text-gray-400 pt-1">
             <Users className="h-4 w-4 mr-1.5" />
            {room.participants} active users
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
