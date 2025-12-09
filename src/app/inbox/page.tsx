
'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { PrivateChat } from '@/lib/types';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/shared/header';

export default function InboxPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const chatsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'privateChats'),
            where('participantIds', 'array-contains', user.uid),
            orderBy('lastMessage.createdAt', 'desc')
          )
        : null,
    [firestore, user]
  );

  const { data: chats, isLoading } = useCollection<PrivateChat>(chatsQuery);

  const getOtherParticipant = (chat: PrivateChat) => {
    if (!user) return null;
    const otherId = chat.participantIds.find(id => id !== user.uid);
    return otherId ? chat.participants[otherId] : null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
        <Header/>
        <main className="flex-1 container mx-auto px-4 py-8">
             <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Inbox</h1>
            </div>

            {isLoading && (
                 <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 bg-[#1c1c1c] p-3 rounded-xl animate-pulse">
                            <div className="h-12 w-12 rounded-full bg-muted"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!isLoading && chats && chats.length > 0 ? (
                <div className="space-y-3">
                    {chats.map(chat => {
                        const otherParticipant = getOtherParticipant(chat);
                        if (!otherParticipant) return null;

                        return (
                            <Link href={`/inbox/${chat.id}`} key={chat.id} className="block">
                                <div className="flex items-center gap-3 bg-[#1c1c1c] p-3 rounded-xl hover:bg-card transition-colors">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={otherParticipant.profileImageUrl} />
                                        <AvatarFallback>{otherParticipant.username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-semibold text-base truncate">{otherParticipant.username}</h4>
                                        <p className="text-sm text-gray-400 truncate">
                                            {chat.lastMessage?.senderId === user?.uid && 'You: '}
                                            {chat.lastMessage?.text || 'No messages yet'}
                                        </p>
                                    </div>
                                    {chat.lastMessage?.createdAt && (
                                         <span className="text-xs text-gray-500">
                                             {formatDistanceToNow(chat.lastMessage.createdAt.toDate(), { addSuffix: true })}
                                         </span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                !isLoading && (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold mb-2">Your inbox is empty</h2>
                        <p className="text-muted-foreground">Start a conversation from a user's profile.</p>
                    </div>
                )
            )}

        </main>
    </div>
  );
}
