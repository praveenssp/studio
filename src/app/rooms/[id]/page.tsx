
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import ParticipantCard from '@/components/chat/participant-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useCollection,
  useDoc,
  useFirestore,
  useUser,
  addDocumentNonBlocking,
} from '@/firebase';
import type { Room, ChatMessage } from '@/lib/types';
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

const participants = [
  {
    name: 'Admin',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar1'),
    isMuted: false,
    isSpeaking: true,
    isAdmin: true,
  },
  {
    name: 'User 1',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar2'),
    isMuted: false,
    isSpeaking: false,
    isAdmin: false,
  },
  {
    name: 'User 2',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar3'),
    isMuted: true,
    isSpeaking: false,
    isAdmin: false,
  },
  {
    name: 'User 3',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar4'),
    isMuted: false,
    isSpeaking: false,
    isAdmin: false,
  },
  {
    name: 'User 4',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar5'),
    isMuted: false,
    isSpeaking: false,
    isAdmin: false,
  },
    {
    name: 'User 5',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar6'),
    isMuted: false,
    isSpeaking: false,
    isAdmin: false,
  },
];

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const roomRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'rooms', params.id) : null),
    [firestore, params.id]
  );
  const { data: room, isLoading: isRoomLoading } = useDoc<Room>(roomRef);

  const messagesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'rooms', params.id, 'messages'),
            orderBy('createdAt', 'asc')
          )
        : null,
    [firestore, params.id]
  );
  const { data: messages, isLoading: areMessagesLoading } =
    useCollection<ChatMessage>(messagesQuery);

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
        params.id,
        'messages'
      );
      await addDocumentNonBlocking(messagesCollection, messageData);
      form.reset();
    }
  };

  if (isRoomLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading room...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-3">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/rooms">
                <ArrowLeft />
                </Link>
            </Button>
            <h1 className="text-xl font-bold truncate">{room?.name || 'Room'}</h1>
            <Button variant="ghost" size="icon">⋮</Button>
            </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col container mx-auto px-4 py-4 gap-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {participants.map((p, index) => (
            <ParticipantCard key={index} participant={p} />
          ))}
        </div>

        <ScrollArea className="flex-grow rounded-lg bg-card p-4">
            {areMessagesLoading ? (
              <p className="text-muted-foreground">Loading messages...</p>
            ) : (
             messages && messages.length > 0 ? (
                messages.map(msg => (
                    <div key={msg.id} className="text-sm mb-2">
                    <span className="font-bold">{msg.senderName}:</span> <span className="text-white/80">{msg.text}</span>
                    </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No messages yet. Be the first to speak!</p>
                </div>
              )
            )}
        </ScrollArea>
      </main>
      
      <footer className="sticky bottom-0 bg-card border-t">
        <div className="container mx-auto p-3">
          <form
            className="flex items-center gap-2"
            onSubmit={handleSendMessage}
          >
            <Input
              name="message"
              placeholder="Type a message..."
              autoComplete="off"
              className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" size="icon" className="rounded-full">
              <Send />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
