import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { Mic, MicOff } from "lucide-react";

type Participant = {
  name: string;
  avatar?: ImagePlaceholder;
  isMuted: boolean;
  isSpeaking: boolean;
  isAdmin?: boolean;
};

type ParticipantCardProps = {
  participant: Participant;
};

export default function ParticipantCard({ participant }: ParticipantCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-3 text-center aspect-square flex flex-col items-center justify-center",
        participant.isAdmin ? "bg-primary/20 text-primary-foreground" : "bg-card",
        participant.isSpeaking ? "ring-2 ring-primary" : ""
      )}
    >
        <Avatar className={cn(
            "h-16 w-16 mx-auto border-2 mb-2",
            participant.isSpeaking ? "border-primary" : "border-transparent"
          )}>
          {participant.avatar && <AvatarImage src={participant.avatar.imageUrl} alt={participant.name} />}
          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="font-semibold text-center truncate w-full text-sm">{participant.name}</p>
        
        <div className="absolute top-2 right-2 bg-black/30 rounded-full p-1">
            {participant.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
        </div>

        {participant.isAdmin && (
            <div className="absolute bottom-2 text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                ADMIN
            </div>
        )}
    </div>
  );
}
