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
        <div className='container mx-auto px-4'>
            <div className="flex justify-between items-center py-4">
            <Button variant="ghost" asChild>
                <Link href="/rooms">
                <ArrowLeft />
                </Link>
            </Button>
            <h1 className="text-xl font-bold">{room?.name || 'Room'}</h1>
            <Button variant="ghost">⋮</Button>
            </div>
        </div>

        <div className="container mx-auto px-4 flex-grow flex flex-col gap-4">
        
        <div className="grid grid-cols-3 gap-2.5 p-2.5">
          {participants.map((p, index) => (
            <ParticipantCard key={index} participant={p} />
          ))}
        </div>

        <div className="flex-grow flex flex-col justify-end bg-transparent rounded-lg p-2.5">
          <div className="space-y-2 overflow-y-auto h-full">
            {areMessagesLoading ? (
              <p>Loading messages...</p>
            ) : (
              messages?.map(msg => (
                <div key={msg.id}>
                  <b>{msg.senderName}:</b> {msg.text} 🔊
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <footer className="bg-[#111] sticky bottom-0">
        <div className="container mx-auto p-3 flex items-center gap-2">
          <form
            className="flex-grow flex items-center gap-2"
            onSubmit={handleSendMessage}
          >
            <Input
              name="message"
              placeholder="Type a message..."
              autoComplete="off"
               className="flex-1 p-3 border-none bg-transparent"
            />
            <Button type="submit">
              Send
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
