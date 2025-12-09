import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ImagePlaceholder } from "@/lib/placeholder-images";

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
        "relative rounded-2xl p-4 text-center",
        participant.isAdmin ? "bg-[#ff9800] text-black" : "bg-[#1e1e1e]",
        participant.isSpeaking ? "ring-2 ring-primary" : ""
      )}
    >
        <Avatar className={cn(
            "h-20 w-20 mx-auto border-2",
            participant.isSpeaking ? "border-primary" : "border-transparent"
          )}>
          {participant.avatar && <AvatarImage src={participant.avatar.imageUrl} alt={participant.name} />}
          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="mt-3 font-semibold text-center truncate w-full">{participant.name}</p>
    </div>
  );
}
