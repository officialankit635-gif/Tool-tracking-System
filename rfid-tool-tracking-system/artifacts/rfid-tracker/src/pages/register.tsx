import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowRightLeft } from "lucide-react";
import { useRegister } from "@workspace/api-client-react";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Register() {
  const { login } = useAuth();
  const registerApi = useRegister();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    registerApi.mutate({ data: values }, {
      onSuccess: (data) => {
        login(data.token, data.user);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg">
          <ArrowRightLeft className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter">RFID Tracker</h1>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">New Operator Setup</p>
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Create Operator Account</CardTitle>
          <CardDescription>Register a new badge to access the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className="bg-background/50 font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@warehouse.local" className="bg-background/50 font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" className="bg-background/50 font-mono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold" disabled={registerApi.isPending}>
                {registerApi.isPending ? "REGISTERING..." : "REGISTER"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-bold">Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
