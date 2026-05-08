import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLogin as useLoginApi } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowRightLeft } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const { login } = useAuth();
  const loginApi = useLoginApi();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    loginApi.mutate({ data: values }, {
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
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Command Center Login</p>
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Enter your credentials to access the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" className="w-full font-bold" disabled={loginApi.isPending}>
                {loginApi.isPending ? "AUTHENTICATING..." : "LOGIN"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            No account? <Link href="/register" className="text-primary hover:underline font-bold">Register here</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
