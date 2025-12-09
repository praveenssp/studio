"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Camera } from "lucide-react";
import { useUser, useAuth } from "@/firebase";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const profileSchema = z.object({
  displayName: z.string().min(1, { message: "Name is required." }),
  email: z.string().email(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export default function ProfileForm() {
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        currentPassword: "",
        newPassword: "",
    }
  })

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    try {
        await updateProfile(user, { displayName: values.displayName });
        toast({
            title: "Profile Updated",
            description: "Your information has been saved.",
        });
    } catch(error: any) {
         toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
        });
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    if (!user || !user.email) return;

    const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
    
    try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, values.newPassword);
        toast({
          title: "Password Updated",
          description: "Your password has been successfully changed.",
        });
        passwordForm.reset();
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Error updating password",
            description: error.message,
        });
    }
  }
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('');
  }


  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your name and profile picture.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-8">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                        {user?.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8">
                            <Camera className="h-4 w-4"/>
                            <span className="sr-only">Change avatar</span>
                        </Button>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user?.displayName || 'User'}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                 <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input disabled {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit">Save Changes</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>For your security, we recommend using a strong password.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="A secure new password" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Update Password</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
