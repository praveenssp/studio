import { MessageCircle } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <MessageCircle className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Whisper Rooms
      </h1>
    </div>
  );
}
