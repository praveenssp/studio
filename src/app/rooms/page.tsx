'use client';

import { useCollection, useFirestore } from '@/firebase';
import RoomCard from '@/components/rooms/room-card';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { Room } from '@/lib/types';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/shared/header';

export default function RoomsPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const roomsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'rooms'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: rooms, isLoading } = useCollection<Room>(roomsQuery);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-xl p-4">
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const getImageForRoom = (index: number) => {
    const images = [
      PlaceHolderImages.find((img) => img.id === "room-background-1"),
      PlaceHolderImages.find((img) => img.id === "room-background-2"),
      PlaceHolderImages.find((img) => img.id === "room-background-3"),
    ];
    return images[index % images.length];
  }


  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, index) => (
              <RoomCard key={room.id} room={{...room, image: getImageForRoom(index), participants: 0}} />
            ))}
          </div>
        ) : (
           <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No rooms available</h2>
              <p className="text-muted-foreground">Why not create one and get the conversation started?</p>
          </div>
        )}
      </div>
    </>
  );
}
