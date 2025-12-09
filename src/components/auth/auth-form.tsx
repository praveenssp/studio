
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile, UserCredential, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase/provider";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { UserProfile } from "@/lib/types";


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const registerSchema = z.object({
  username: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/rooms");
    }
  }, [user, router]);
  

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      if (!auth) throw new Error("Auth service not available.");
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Success!",
        description: "Redirecting to your rooms...",
      });
      router.push("/rooms");
    } catch (error: any) {
      toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: error.code === 'auth/invalid-credential' 
              ? 'Incorrect email or password. Please try again.'
              : error.message,
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  async function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    if (!firestore || !auth) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "A required service is not available.",
        });
        return;
    }
    setIsSubmitting(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        
        const profileImageUrl = `https://picsum.photos/seed/${userCredential.user.uid}/100`;
        await updateProfile(userCredential.user, { 
            displayName: values.username,
            photoURL: profileImageUrl 
        });
        
        const userProfileRef = doc(firestore, 'users', userCredential.user.uid);
        const userProfileData: UserProfile = {
            id: userCredential.user.uid,
            username: values.username,
            email: values.email,
            profileImageUrl: profileImageUrl
        }
        
        setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });

        toast({
          title: "Registration Successful!",
          description: "Redirecting to your rooms...",
        });
        router.push("/rooms");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  if (isUserLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <Card className="bg-card text-card-foreground p-6 rounded-2xl text-center">
      <CardContent className="p-0">
        <h2 className="text-2xl font-bold">Easy Voice</h2>
        <p className="text-muted-foreground mb-6">Connect with voice rooms</p>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className="bg-input border-none text-foreground placeholder:text-muted-foreground" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="password" className="bg-input border-none text-foreground placeholder:text-muted-foreground" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="signup">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className="bg-input border-none text-foreground placeholder:text-muted-foreground" placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className="bg-input border-none text-foreground placeholder:text-muted-foreground" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="password" className="bg-input border-none text-foreground placeholder:text-muted-foreground" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
