import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { Mic, MicOff, Crown } from "lucide-react";

type Participant = {
  name: string;
  avatar?: ImagePlaceholder;
  isMuted?: boolean;
  isSpeaking?: boolean;
  isAdmin?: boolean;
};

type ParticipantCardProps = {
  participant: Participant;
};

export default function ParticipantCard({ participant }: ParticipantCardProps) {
  return (
    <div
      className={cn(
        "relative p-3 text-center aspect-square flex flex-col items-center justify-start",
      )}
    >
        <div className="relative">
            <Avatar className={cn(
                "h-16 w-16 mx-auto border-2",
                participant.isSpeaking ? "border-primary" : "border-transparent",
                 participant.isAdmin ? "border-yellow-400" : ""
              )}>
              {participant.avatar && <AvatarImage src={participant.avatar.imageUrl} alt={participant.name} />}
              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {participant.isAdmin && (
                 <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 transform rotate-[30deg]" fill="currentColor"/>
            )}
             <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>

        </div>

        <p className="font-semibold text-center truncate w-full text-sm mt-2">{participant.name}</p>
        
        {participant.isMuted !== undefined && (
          <div className="absolute top-2 right-2 bg-black/30 rounded-full p-1 text-white">
              {participant.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
          </div>
        )}
    </div>
  );
}
