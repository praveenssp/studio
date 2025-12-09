
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth, addDocumentNonBlocking } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase/provider";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { collection, doc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";


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
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Login Successful",
        description: "Redirecting to your rooms...",
      });
      router.push("/rooms");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    }
  }

  async function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firestore is not available.",
        });
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.username });
      
      const userProfileRef = doc(firestore, 'users', userCredential.user.uid);
      const userProfileData = {
          id: userCredential.user.uid,
          username: values.username,
          email: values.email,
          profileImageUrl: userCredential.user.photoURL || ""
      }
      
      setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });

      toast({
        title: "Registration Successful",
        description: "Redirecting to the rooms...",
      });
      router.push("/rooms");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
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
    <Card className="bg-white text-black p-6 rounded-2xl text-center">
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
                        <Input className="bg-gray-100 border-none text-black placeholder:text-gray-500" placeholder="Email" {...field} />
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
                        <Input type="password" className="bg-gray-100 border-none text-black placeholder:text-gray-500" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-full" disabled={loginForm.formState.isSubmitting}>
                  {loginForm.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
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
                        <Input className="bg-gray-100 border-none text-black placeholder:text-gray-500" placeholder="Username" {...field} />
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
                        <Input className="bg-gray-100 border-none text-black placeholder:text-gray-500" placeholder="Email" {...field} />
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
                        <Input type="password" className="bg-gray-100 border-none text-black placeholder:text-gray-500" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-full" disabled={registerForm.formState.isSubmitting}>
                  {registerForm.formState.isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
