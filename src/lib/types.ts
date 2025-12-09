
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
