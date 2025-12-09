
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, Send, Crown, Trash2, CheckCheck } from 'lucide-react';
import {
  useCollection,
  useDoc,
  useFirestore,
  useUser,
  addDocumentNonBlocking,
} from '@/firebase';
import type { Room, ChatMessage, UserProfile } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import {
  collection,
  query,
  orderBy,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const initialParticipants = [
  {
    id: '1',
    name: 'Admin',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar1'),
    isAdmin: true,
  },
  {
    id: '2',
    name: 'Arun',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar2'),
    isAdmin: false,
  },
  {
    id: '3',
    name: 'Kavi',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar3'),
    isAdmin: false,
  },
  {
    id: '4',
    name: 'Raja',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar4'),
    isAdmin: false,
  },
  {
    id: '5',
    name: 'Selvi',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar5'),
    isAdmin: false,
  },
];


export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();
  const { user } = useUser();

  const roomRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'rooms', id) : null),
    [firestore, id]
  );
  const { data: room, isLoading: isRoomLoading } = useDoc<Room>(roomRef);

  const messagesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'rooms', id, 'messages'),
            orderBy('createdAt', 'asc')
          )
        : null,
    [firestore, id]
  );
  const { data: messages, isLoading: areMessagesLoading } =
    useCollection<ChatMessage>(messagesQuery);
    
  const { data: roomCreatorProfile } = useDoc<UserProfile>(
      useMemoFirebase(() => (firestore && room?.creatorId ? doc(firestore, 'users', room.creatorId) : null) ,[firestore, room])
  );

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user) return;

    const form = e.currentTarget;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    const messageText = input.value.trim();

    if (messageText) {
      const messageData = {
        id: uuidv4(),
        text: messageText,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
      };
      const messagesCollection = collection(
        firestore,
        'rooms',
        id,
        'messages'
      );
      await addDocumentNonBlocking(messagesCollection, messageData);
      form.reset();
    }
  };

  if (isRoomLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>Loading room...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-card-foreground">
      <header className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center text-white">
          <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20 hover:text-white">
            <Link href="/rooms">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-xl font-bold truncate">{room?.name || "Chat Room"}</h1>
          <Button variant="outline" className="rounded-full bg-white text-blue-600 border-none hover:bg-gray-200">5 Online</Button>
        </div>
      </header>

      <main className="flex-grow flex flex-col container mx-auto px-4 py-4 gap-4 overflow-hidden">
        <div className="flex flex-col items-center text-black">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white ring-4 ring-yellow-400">
                <AvatarImage src={roomCreatorProfile?.profileImageUrl} />
                <AvatarFallback className="text-3xl">
                    {roomCreatorProfile?.username?.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <Crown className="absolute -top-3 -right-3 h-8 w-8 text-yellow-400 transform rotate-[30deg]" fill="currentColor" />
             <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-3">
          {initialParticipants.map(p => (
            <div key={p.id} className="flex flex-col items-center gap-1">
                 <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage src={p.avatar?.imageUrl} alt={p.name} />
                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-xs text-black font-medium">{p.name}</p>
            </div>
          ))}
        </div>

        <div className="flex-grow bg-card rounded-t-3xl p-4 flex flex-col">
            <ScrollArea className="flex-grow">
                <div className="space-y-4">
                {areMessagesLoading ? (
                <p className="text-muted-foreground">Loading messages...</p>
                ) : (
                messages && messages.length > 0 ? (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={undefined} />
                                <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className={`p-3 rounded-2xl max-w-[70%] ${msg.senderId === user?.uid ? 'bg-yellow-200 rounded-br-none' : 'bg-white rounded-bl-none'}`}>
                                <p className="font-bold text-sm">{msg.senderName}</p>
                                <p className="text-sm">{msg.text}</p>
                                <div className="flex justify-end items-center mt-1">
                                    <CheckCheck className="h-4 w-4 text-blue-500" />
                                </div>
                            </div>
                            {msg.senderId === user?.uid && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No messages yet. Be the first to speak!</p>
                    </div>
                )
                )}
                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground italic">Admin is typing...</p>
                </div>
                </div>
            </ScrollArea>
        
            <div className="mt-auto pt-4">
            <form
                className="flex items-center gap-3"
                onSubmit={handleSendMessage}
            >
                <Input
                name="message"
                placeholder="Type message..."
                autoComplete="off"
                className="flex-1 bg-white rounded-full border-gray-300 focus-visible:ring-primary"
                />
                <Button type="submit" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6">
                Send
                </Button>
            </form>
            </div>
        </div>

      </main>
    </div>
  );
}
