"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ChatControls() {
  const [isMuted, setIsMuted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
    });
  };

  const leaveRoom = () => {
    toast({
      title: "You left the room",
    });
    router.push("/rooms");
  };

  return (
    <footer className="bg-card/80 border-t backdrop-blur-sm sticky bottom-0">
      <div className="container mx-auto px-4 py-3 flex justify-center items-center gap-4">
        <Button
          variant={isMuted ? "outline" : "default"}
          size="lg"
          className="rounded-full h-14 w-14 p-0"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
        <Button
          variant="destructive"
          size="lg"
          className="rounded-full h-14 w-14 p-0"
          onClick={leaveRoom}
          aria-label="Leave Room"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </footer>
  );
}
