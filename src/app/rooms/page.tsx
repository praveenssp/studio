'use client';

import { useCollection, useFirestore } from '@/firebase';
import RoomCard from '@/components/rooms/room-card';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { Room } from '@/lib/types';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Header from '@/components/shared/header';

export default function RoomsPage() {
  const firestore = useFirestore();

  const roomsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'rooms'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: rooms, isLoading } = useCollection<Room>(roomsQuery);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-xl p-4 space-y-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }
  
  const getImageForRoom = (index: number) => {
    const images = [
      PlaceHolderImages.find((img) => img.id === "room-background-1"),
      PlaceHolderImages.find((img) => img.id === "room-background-2"),
      PlaceHolderImages.find((img) => img.id === "room-background-3"),
    ];
    const image = images[index % images.length];
    return image ? image.imageUrl : 'https://picsum.photos/seed/1/600/400';
  }


  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rooms.map((room, index) => (
              <RoomCard key={room.id} room={{...room, imageUrl: getImageForRoom(index), participants: 0}} />
            ))}
          </div>
        ) : (
           <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No rooms available</h2>
              <p className="text-muted-foreground">Why not create one and get the conversation started?</p>
          </div>
        )}
      </main>
    </div>
  );
}
