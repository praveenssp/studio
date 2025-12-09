"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';


const createRoomSchema = z.object({
  name: z.string().min(3, { message: "Room name must be at least 3 characters." }).max(50),
  description: z.string().max(100).optional(),
  isPublic: z.boolean().default(true),
});

export default function CreateRoomForm() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: true,
    },
  });

  async function onSubmit(values: z.infer<typeof createRoomSchema>) {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to create a room.",
        });
        return;
    }

    const newRoomId = uuidv4();
    const roomData = {
        id: newRoomId,
        name: values.name,
        description: values.description || "",
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        // isPublic: values.isPublic, // This field is not in the schema
    };

    try {
        const roomsCollection = collection(firestore, "rooms");
        await addDocumentNonBlocking(roomsCollection, roomData);

        toast({
            title: "Room Created!",
            description: `The room "${values.name}" is now live.`,
        });

        router.push(`/rooms/${newRoomId}`);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Failed to create room",
            description: error.message,
        });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Late Night Vibes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's this room about?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Public Room</FormLabel>
                    <FormDescription>
                      Public rooms are visible to everyone.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Room"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
