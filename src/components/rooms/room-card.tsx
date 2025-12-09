import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ImagePlaceholder } from "@/lib/placeholder-images";

type Room = {
  id: string;
  name: string;
  description: string;
  participants: number;
  image?: ImagePlaceholder;
};

type RoomCardProps = {
  room: Room;
};

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      <CardHeader>
        {room.image && (
          <div className="relative aspect-video w-full rounded-t-lg overflow-hidden mb-4">
            <Image
              src={room.image.imageUrl}
              alt={room.image.description}
              fill
              className="object-cover"
              data-ai-hint={room.image.imageHint}
            />
          </div>
        )}
        <CardTitle>{room.name}</CardTitle>
        <CardDescription>{room.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          <span>{room.participants} participants</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/rooms/${room.id}`}>Join Room</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
