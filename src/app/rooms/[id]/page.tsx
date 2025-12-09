
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Send, Crown, Trash2, CheckCheck, MoreVertical, RefreshCw, Eraser, UserPlus, User, MessageSquare, XCircle, Ban, Check, X, Users, LogIn } from 'lucide-react';
import {
  useCollection,
  useDoc,
  useFirestore,
  useUser,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import type { Room, ChatMessage, UserProfile, PrivateChat } from '@/lib/types';
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
  where,
  limit,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const mockUsers = [
  { id: 'user-1', username: 'Alex', profileImageUrl: 'https://picsum.photos/seed/a/100' },
  { id: 'user-2', username: 'Maria', profileImageUrl: 'https://picsum.photos/seed/b/100' },
  { id: 'user-3', username: 'David', profileImageUrl: 'https://picsum.photos/seed/c/100' },
  { id: 'user-4', username: 'Sophia', profileImageUrl: 'https://picsum.photos/seed/d/100' },
  { id: 'user-5', username: 'Kenji', profileImageUrl: 'https://picsum.photos/seed/e/100' },
];

export default function ChatRoomPage({ params: { id } }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  
  // State for participants and join requests
  const [participants, setParticipants] = useState(mockUsers.slice(0, 1)); // Start with one participant
  const [joinRequests, setJoinRequests] = useState(mockUsers.slice(1, 3)); // Two users requesting to join
  const [blockedUsers, setBlockedUsers] = useState<typeof mockUsers>([]);
  const availableUsers = mockUsers.filter(u => ![...participants.map(p => p.id), ...joinRequests.map(r => r.id), ...blockedUsers.map(b => b.id)].includes(u.id));


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
  const { data: messages, isLoading: areMessagesLoading } = useCollection<ChatMessage>(messagesQuery);
    
  const { data: roomCreatorProfile } = useDoc<UserProfile>(
      useMemoFirebase(() => (firestore && room?.creatorId ? doc(firestore, 'users', room.creatorId) : null) ,[firestore, room])
  );
  
  const { data: currentUserProfile } = useDoc<UserProfile>(
      useMemoFirebase(() => (firestore && user?.uid ? doc(firestore, 'users', user.uid) : null), [firestore, user])
  );

  const isCreator = user?.uid === room?.creatorId;
  
  const allParticipants = useMemo(() => {
    const participantMap = new Map();
    if (roomCreatorProfile) {
        participantMap.set(roomCreatorProfile.id, roomCreatorProfile);
    }
    participants.forEach(p => participantMap.set(p.id, p));
    return Array.from(participantMap.values());
  }, [roomCreatorProfile, participants]);


   const handleStartPrivateChat = async (targetUser: {id: string, username: string, profileImageUrl?: string}) => {
    if (!firestore || !user || !currentUserProfile || !targetUser || user.uid === targetUser.id) return;

    try {
        const chatsRef = collection(firestore, 'privateChats');
        // Firestore doesn't support array-contains-all, so we query twice. A more complex query might be needed for groups.
        const q1 = query(chatsRef, where('participantIds', '==', [user.uid, targetUser.id]));
        const q2 = query(chatsRef, where('participantIds', '==', [targetUser.id, user.uid]));

        const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        const existingChats = [...querySnapshot1.docs, ...querySnapshot2.docs];

        if (existingChats.length > 0) {
            // Chat already exists, navigate to it
            router.push(`/inbox/${existingChats[0].id}`);
        } else {
            // Create a new chat
            const newChatId = uuidv4();
            const newChatData: PrivateChat = {
                id: newChatId,
                participantIds: [user.uid, targetUser.id],
                participants: {
                    [user.uid]: {
                        username: currentUserProfile.username,
                        profileImageUrl: currentUserProfile.profileImageUrl || ''
                    },
                    [targetUser.id]: {
                        username: targetUser.username,
                        profileImageUrl: targetUser.profileImageUrl || ''
                    }
                },
                createdAt: serverTimestamp(),
            };
            const chatDocRef = doc(firestore, 'privateChats', newChatId);
            await setDocumentNonBlocking(chatDocRef, newChatData);
            router.push(`/inbox/${newChatId}`);
        }
    } catch (error) {
        console.error("Error starting private chat:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not start a private chat."
        });
    }
  };


  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user || !currentUserProfile) return;

    const form = e.currentTarget;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    const messageText = input.value.trim();

    if (messageText) {
      const messageData: ChatMessage = {
        id: uuidv4(),
        text: messageText,
        senderId: user.uid,
        senderName: currentUserProfile.username || 'Anonymous',
        senderImage: currentUserProfile.profileImageUrl || '',
        createdAt: serverTimestamp(),
      };
      const messagesCollection = collection(firestore, 'rooms', id, 'messages');
      addDocumentNonBlocking(messagesCollection, messageData);
      form.reset();
    }
  };

  const handleRefresh = () => window.location.reload();

  const handleClearMessages = async () => {
    if (!firestore || !messagesQuery) return;
    setIsClearAlertOpen(false);
    try {
        const querySnapshot = await getDocs(messagesQuery);
        const batch = writeBatch(firestore);
        querySnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        toast({ title: "Messages cleared." });
    } catch (error) {
        console.error("Error clearing messages: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not clear messages." });
    }
  };

  const handleDeleteRoom = async () => {
    if (!firestore || !roomRef) return;
    setIsDeleteAlertOpen(false);
    try {
      if (messagesQuery) {
        const messagesSnapshot = await getDocs(messagesQuery);
        const batch = writeBatch(firestore);
        messagesSnapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
      await deleteDoc(roomRef);
      toast({ title: `Room "${room?.name}" deleted.` });
      router.push('/rooms');
    } catch (error) {
      console.error("Error deleting room: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete the room." });
    }
  };
  
  const handleRequestToJoin = () => {
    if (availableUsers.length > 0) {
      const newUser = availableUsers[0];
      setJoinRequests([...joinRequests, newUser]);
      toast({ title: `${newUser.username} requested to join.`})
    }
  };

  const handleAcceptRequest = (requestingUser: typeof mockUsers[0]) => {
    if (participants.length < 5) {
      setParticipants([...participants, requestingUser]);
      setJoinRequests(joinRequests.filter(r => r.id !== requestingUser.id));
      toast({ title: `Accepted ${requestingUser.username}.`})
    } else {
      toast({ variant: 'destructive', title: "Room is full."})
    }
  };
  
  const handleDeclineRequest = (requestingUser: typeof mockUsers[0]) => {
    setJoinRequests(joinRequests.filter(r => r.id !== requestingUser.id));
    toast({ title: `Declined ${requestingUser.username}.`})
  }

  const handleRemoveParticipant = (participantId: string) => {
    setParticipants(participants.filter(p => p.id !== participantId));
    toast({ title: `Removed user from seat.`})
  }
  
  const handleBlockUser = (userToBlock: {id: string, username: string}) => {
    handleRemoveParticipant(userToBlock.id);
    const fullUserToBlock = mockUsers.find(u => u.id === userToBlock.id);
    if (fullUserToBlock && !blockedUsers.find(u => u.id === userToBlock.id)) {
        setBlockedUsers([...blockedUsers, fullUserToBlock]);
    }
    toast({ title: `User ${userToBlock.username} blocked.`});
  }
  
  const handleUnblockUser = (userIdToUnblock: string) => {
    setBlockedUsers(blockedUsers.filter(u => u.id !== userIdToUnblock));
     toast({ title: `User unblocked.`});
  }
  
  const handleAddToSeat = (userToAdd: {id: string, username: string}) => {
    const fullUser = mockUsers.find(u => u.id === userToAdd.id);
    if(fullUser && participants.length < 5 && !participants.find(p => p.id === fullUser.id)) {
        setParticipants([...participants, fullUser]);
        toast({ title: `${userToAdd.username} was added to a seat.` });
    } else if(participants.length >= 5) {
        toast({ variant: 'destructive', title: 'Room is full.'});
    } else {
        toast({ variant: 'destructive', title: 'User is already in a seat.'});
    }
  }


  if (isRoomLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>Loading room...</p>
      </div>
    );
  }

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
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold truncate">{room?.name || "Chat Room"}</h1>
              <Sheet>
                <SheetTrigger asChild>
                  <button className="text-xs text-gray-400 hover:text-white">
                    Online: {allParticipants.length}
                  </button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Online Users</SheetTitle>
                    <SheetDescription>
                      Manage active and blocked users in this room.
                    </SheetDescription>
                  </SheetHeader>
                  <Tabs defaultValue="active" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="active">Active ({allParticipants.length})</TabsTrigger>
                      <TabsTrigger value="blocked">Blocked ({blockedUsers.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active">
                      <ScrollArea className="h-[70vh]">
                        <div className="space-y-3 mt-4">
                          {allParticipants.map(p => (
                            <div key={p.id} className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={p.profileImageUrl} />
                                <AvatarFallback>{p.username?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <p className="font-medium">{p.username}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="blocked">
                      <ScrollArea className="h-[70vh]">
                        <div className="space-y-3 mt-4">
                          {blockedUsers.length > 0 ? blockedUsers.map(u => (
                            <div key={u.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={u.profileImageUrl} />
                                  <AvatarFallback>{u.username.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="font-medium">{u.username}</p>
                              </div>
                              <Button variant="outline" onClick={() => handleUnblockUser(u.id)}>Unblock</Button>
                            </div>
                          )) : <p className="text-sm text-muted-foreground text-center mt-8">No users have been blocked.</p>}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </SheetContent>
              </Sheet>
          </div>
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
        <div className="flex gap-3 justify-center items-start">
            <div className="grid grid-cols-5 gap-3 flex-1">
              {/* Admin Seat */}
              {roomCreatorProfile && (
                <div className="flex flex-col items-center gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="relative">
                                <Avatar className="h-16 w-16 border-2 border-yellow-400">
                                    <AvatarImage src={roomCreatorProfile?.profileImageUrl} />
                                    <AvatarFallback className="text-lg">{roomCreatorProfile?.username?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 transform rotate-[30deg]" fill="currentColor" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => router.push(`/profile`)}>
                                <User className="mr-2 h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                             <DropdownMenuItem>
                                <UserPlus className="mr-2 h-4 w-4" /> Follow
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStartPrivateChat(roomCreatorProfile)}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Message
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-xs text-white font-medium">{roomCreatorProfile?.username || 'Admin'}</p>
                </div>
              )}
              
              {/* Participant Seats */}
              {participants.slice(0).map(p => {
                if (p.id === roomCreatorProfile?.id) return null; // Don't render admin again
                return (
                 <div key={p.id} className="flex flex-col items-center gap-1">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button><Avatar className="h-16 w-16"><AvatarImage src={p.profileImageUrl} /><AvatarFallback>{p.username.charAt(0)}</AvatarFallback></Avatar></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => router.push(`/profile/${p.id}`)}><User className="mr-2 h-4 w-4" /> View Profile</DropdownMenuItem>
                            <DropdownMenuItem><UserPlus className="mr-2 h-4 w-4" /> Follow</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleStartPrivateChat(p)}><MessageSquare className="mr-2 h-4 w-4" /> Message</DropdownMenuItem>
                            {isCreator && <DropdownMenuSeparator />}
                            {isCreator && <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveParticipant(p.id)}><XCircle className="mr-2 h-4 w-4" /> Kick from seat</DropdownMenuItem>}
                            {isCreator && <DropdownMenuItem className="text-destructive" onClick={() => handleBlockUser(p)}><Ban className="mr-2 h-4 w-4" /> Block User</DropdownMenuItem>}
                        </DropdownMenuContent>
                     </DropdownMenu>
                    <p className="text-xs text-white font-medium">{p.username}</p>
                </div>
              )})}

              {/* Empty Seats */}
              {[...Array(Math.max(0, 5 - allParticipants.length))].map((_, index) => (
                <div key={`empty-${index}`} className="flex flex-col items-center gap-1">
                     <Button variant="ghost" className="h-16 w-16 rounded-full border-2 border-dashed border-gray-400 bg-black/10 flex items-center justify-center p-0" onClick={handleRequestToJoin}>
                        <UserPlus className="text-gray-400 h-6 w-6" />
                     </Button>
                    <p className="text-xs text-white font-medium">Empty</p>
                </div>
              ))}
            </div>
        </div>

        {/* Join Requests for Admin */}
        {isCreator && joinRequests.length > 0 && (
            <Card>
                <CardHeader><CardTitle className="text-base text-white">Join Requests</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {joinRequests.map(req => (
                        <div key={req.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={req.profileImageUrl} />
                                    <AvatarFallback>{req.username.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-white">{req.username}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600" onClick={() => handleAcceptRequest(req)}><Check className="h-4 w-4" /></Button>
                                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeclineRequest(req)}><X className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}


        <div className="flex-grow bg-card rounded-t-3xl p-4 flex flex-col">
            <ScrollArea className="flex-grow">
                <div className="space-y-4">
                {areMessagesLoading ? (
                <p className="text-muted-foreground">Loading messages...</p>
                ) : (
                messages && messages.length > 0 ? (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button disabled={msg.senderId === user?.uid}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.senderImage} />
                                            <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                {msg.senderId !== user?.uid && (
                                     <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => router.push(`/profile/${msg.senderId}`)}>
                                            <User className="mr-2 h-4 w-4" /> View Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <UserPlus className="mr-2 h-4 w-4" /> Follow
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStartPrivateChat({id: msg.senderId, username: msg.senderName, profileImageUrl: msg.senderImage})}>
                                            <MessageSquare className="mr-2 h-4 w-4" /> Message
                                        </DropdownMenuItem>
                                        {isCreator && <DropdownMenuSeparator />}
                                        {isCreator && (
                                            <DropdownMenuItem onClick={() => handleAddToSeat({id: msg.senderId, username: msg.senderName })}>
                                                <LogIn className="mr-2 h-4 w-4" /> Add to Seat
                                            </DropdownMenuItem>
                                        )}
                                        {isCreator && (
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleBlockUser({id: msg.senderId, username: msg.senderName})}>
                                                <Ban className="mr-2 h-4 w-4" /> Block User
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                )}
                            </DropdownMenu>
                            <div className={`p-3 rounded-2xl max-w-[70%] ${msg.senderId === user?.uid ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-white rounded-bl-none'}`}>
                                <p className="font-bold text-sm">{msg.senderName}</p>
                                <p className="text-sm">{msg.text}</p>
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
