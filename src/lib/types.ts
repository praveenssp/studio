
export type Room = {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  createdAt: any; // Firestore timestamp
};

export type UserProfile = {
    id: string;
    username: string;
    email?: string;
    profileImageUrl?: string;
    phoneNumber?: string;
}

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  createdAt: any; // Firestore timestamp
}

export type PrivateChat = {
    id: string;
    participantIds: string[];
    participants: Record<string, Pick<UserProfile, 'username' | 'profileImageUrl'>>;
    lastMessage?: {
        text: string;
        senderId: string;
        createdAt: any;
    };
    createdAt: any;
}

export type PrivateMessage = {
    id: string;
    text: string;
    senderId: string;
    createdAt: any;
}
