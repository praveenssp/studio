'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, Users, Send } from 'lucide-react';
import ChatControls from '@/components/chat/chat-controls';
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

const participants = [
  {
    name: 'Alice',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar1'),
    isMuted: false,
    isSpeaking: true,
  },
  {
    name: 'Bob',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar2'),
    isMuted: false,
    isSpeaking: false,
  },
  {
    name: 'Charlie',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar3'),
    isMuted: true,
    isSpeaking: false,
  },
  {
    name: 'David',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar4'),
    isMuted: false,
    isSpeaking: false,
  },
  {
    name: 'Eve',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar5'),
    isMuted: false,
    isSpeaking: false,
  },
  {
    name: 'Frank',
    avatar: PlaceHolderImages.find(img => img.id === 'avatar6'),
    isMuted: true,
    isSpeaking: false,
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="ghost" asChild className="-ml-4">
              <Link href="/rooms">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Rooms
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{room?.name || 'Room'}</h1>
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

        <div className="flex-grow flex flex-col justify-end bg-muted/20 rounded-lg p-4 mt-4">
          <div className="space-y-2 overflow-y-auto">
            {areMessagesLoading ? (
              <p>Loading messages...</p>
            ) : (
              messages?.map(msg => (
                <div key={msg.id}>
                  <b>{msg.senderName}:</b> {msg.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <footer className="bg-card/80 border-t backdrop-blur-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <form
            className="flex-grow flex items-center gap-2"
            onSubmit={handleSendMessage}
          >
            <Input
              name="message"
              placeholder="Type a message..."
              autoComplete="off"
            />
            <Button type="submit" size="icon">
              <Send />
            </Button>
          </form>
          <ChatControls />
        </div>
      </footer>
    </div>
  );
}
