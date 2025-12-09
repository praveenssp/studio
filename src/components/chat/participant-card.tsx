import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

type Participant = {
  name: string;
  avatar?: ImagePlaceholder;
  isMuted: boolean;
  isSpeaking: boolean;
};

type ParticipantCardProps = {
  participant: Participant;
};

export default function ParticipantCard({ participant }: ParticipantCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        participant.isSpeaking ? "border-primary ring-2 ring-primary" : "border-border",
        participant.isMuted ? "bg-muted/50" : "bg-card"
      )}
    >
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="relative">
          <Avatar className={cn(
              "h-20 w-20 border-2",
              participant.isSpeaking ? "border-primary" : "border-transparent"
            )}>
            {participant.avatar && <AvatarImage src={participant.avatar.imageUrl} alt={participant.name} />}
            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
          </Avatar>
           <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1 border-2 border-card">
            {participant.isMuted ? (
              <MicOff className="h-4 w-4 text-destructive" />
            ) : (
              <Mic className="h-4 w-4 text-foreground" />
            )}
          </div>
        </div>
        <p className="mt-3 font-semibold text-center truncate w-full">{participant.name}</p>
      </CardContent>
    </Card>
  );
}
