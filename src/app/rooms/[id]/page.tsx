
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Send, Crown, Trash2, CheckCheck, MoreVertical, RefreshCw, Eraser, UserPlus } from 'lucide-react';
import {
  useCollection,
  useDoc,
  useFirestore,
  useUser,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import type { Room, ChatMessage, UserProfile } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import {
  collection,
  query,
  orderBy,
  serverTimestamp,
  doc,
  writeBatch,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock data for participants
const mockParticipants = [
  { id: 'user-1', username: 'Alex', profileImageUrl: 'https://picsum.photos/seed/a/100' },
  { id: 'user-2', username: 'Maria', profileImageUrl: 'https://picsum.photos/seed/b/100' },
  { id: 'user-3', username: 'David', profileImageUrl: 'https://picsum.photos/seed/c/100' },
  { id: 'user-4', username: 'Sophia', profileImageUrl: 'https://picsum.photos/seed/d/100' },
  { id: 'user-5', username: 'Kenji', profileImageUrl: 'https://picsum.photos/seed/e/100' },
];

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [participants, setParticipants] = useState(mockParticipants.slice(0, 4));


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
  const { data: messages, isLoading: areMessagesLoading, error: messagesError } =
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
      addDocumentNonBlocking(messagesCollection, messageData);
      form.reset();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearMessages = async () => {
    if (!firestore || !messagesQuery) return;
    setIsClearAlertOpen(false);
    try {
        const querySnapshot = await getDocs(messagesQuery);
        const batch = writeBatch(firestore);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        toast({ title: "Messages cleared." });
    } catch (error) {
        console.error("Error clearing messages: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not clear messages.",
        });
    }
  };

  const handleDeleteRoom = async () => {
    if (!firestore || !roomRef) return;
    setIsDeleteAlertOpen(false);

    try {
      // First, delete all messages in the subcollection
      if (messagesQuery) {
        const messagesSnapshot = await getDocs(messagesQuery);
        const batch = writeBatch(firestore);
        messagesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      // Then, delete the room document itself
      await deleteDoc(roomRef);

      toast({ title: `Room "${room?.name}" deleted.` });
      router.push('/rooms');
    } catch (error) {
      console.error("Error deleting room: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the room.",
      });
    }
  };
  
  const isCreator = user?.uid === room?.creatorId;

  if (isRoomLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>Loading room...</p>
      </div>
    );
  }
  
  const emptySeatImage = PlaceHolderImages.find(img => img.id === 'empty-seat');


  return (
    <>
    <div className="flex flex-col h-screen bg-background text-card-foreground">
      <header className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center text-white">
          <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20 hover:text-white">
            <Link href="/rooms">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-xl font-bold truncate">{room?.name || "Chat Room"}</h1>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Refresh</span>
              </DropdownMenuItem>
              {isCreator && (
                <>
                  <DropdownMenuItem onSelect={() => setIsClearAlertOpen(true)}>
                    <Eraser className="mr-2 h-4 w-4" />
                    <span>Clear Messages</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setIsDeleteAlertOpen(true)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Room</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
          <p className="font-semibold mt-2">{roomCreatorProfile?.username || 'Admin'}</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {participants.map(p => (
            <div key={p.id} className="flex flex-col items-center gap-1">
              <Avatar className="h-16 w-16">
                <AvatarImage src={p.profileImageUrl} />
                <AvatarFallback>{p.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-xs text-black font-medium">{p.username}</p>
            </div>
          ))}
          {[...Array(4 - participants.length)].map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
                 <Avatar className="h-16 w-16 border-2 border-dashed border-gray-400 bg-black/10 flex items-center justify-center">
                    <AvatarFallback className="bg-transparent">
                        <UserPlus className="text-gray-400" />
                    </AvatarFallback>
                </Avatar>
                <p className="text-xs text-black font-medium">Empty</p>
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
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive" onClick={() => deleteDocumentNonBlocking(doc(firestore, 'rooms', id, 'messages', msg.id))}>
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
    
      {/* Alert Dialog for Clearing Messages */}
      <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this room. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearMessages} className="bg-destructive hover:bg-destructive/90">
              Clear Messages
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog for Deleting Room */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the room and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive hover:bg-destructive/90">
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    

    