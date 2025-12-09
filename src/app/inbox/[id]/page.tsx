
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  useCollection,
  useDoc,
  useFirestore,
  useUser,
  addDocumentNonBlocking,
  updateDocumentNonBlocking
} from '@/firebase';
import type { PrivateChat, PrivateMessage, UserProfile } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import {
  collection,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function PrivateChatPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const chatRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'privateChats', params.id) : null),
    [firestore, params.id]
  );
  const { data: chat, isLoading: isChatLoading } = useDoc<PrivateChat>(chatRef);

  const messagesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'privateChats', params.id, 'messages'),
            orderBy('createdAt', 'asc')
          )
        : null,
    [firestore, params.id]
  );
  const { data: messages, isLoading: areMessagesLoading } = useCollection<PrivateMessage>(messagesQuery);
  
  const otherParticipant = useMemo(() => {
    if (!chat || !user) return null;
    const otherId = chat.participantIds.find(id => id !== user.uid);
    return otherId ? chat.participants[otherId] : null;
  }, [chat, user]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user || !chatRef) return;

    const form = e.currentTarget;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    const messageText = input.value.trim();

    if (messageText) {
      const messageData = {
        id: uuidv4(),
        text: messageText,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      };
      
      const lastMessageData = {
        text: messageText,
        senderId: user.uid,
        createdAt: messageData.createdAt,
      }

      const messagesCollection = collection(firestore, 'privateChats', params.id, 'messages');
      await addDocumentNonBlocking(messagesCollection, messageData);
      
      const chatDocRef = doc(firestore, 'privateChats', params.id);
      await updateDocumentNonBlocking(chatDocRef, { lastMessage: lastMessageData });

      form.reset();
    }
  };
  
    if (isChatLoading) {
        return <div className="flex items-center justify-center h-screen">Loading chat...</div>
    }


  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/inbox">
                <ArrowLeft />
              </Link>
            </Button>
            {otherParticipant && (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={otherParticipant.profileImageUrl} />
                        <AvatarFallback>{otherParticipant.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-xl font-bold">{otherParticipant.username}</h1>
                </div>
            )}
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col container mx-auto px-4">
        <div className="flex-grow flex flex-col justify-end p-4 space-y-4 overflow-y-auto">
          {areMessagesLoading ? (
            <p>Loading messages...</p>
          ) : (
            messages?.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.senderId === user?.uid ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                    msg.senderId === user?.uid
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-background border-t">
        <div className="container mx-auto p-3">
          <form
            className="flex items-center gap-2"
            onSubmit={handleSendMessage}
          >
            <Input
              name="message"
              placeholder="Type a message..."
              autoComplete="off"
              className="flex-1 bg-input border-none focus-visible:ring-0 focus-visible:ring-offset-0"
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
