import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTool, getListToolsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const formSchema = z.object({
  toolId: z.string().min(2, "RFID Tag ID is required"),
  name: z.string().min(2, "Name is required"),
  category: z.string().min(2, "Category is required"),
  status: z.enum(["available", "issued", "missing"]).default("available"),
});

export default function NewTool() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createTool = useCreateTool();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toolId: "",
      name: "",
      category: "",
      status: "available",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTool.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        setLocation("/tools");
      },
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/tools">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Register New Tool</h1>
            <p className="text-muted-foreground">Add a new RFID-tagged asset to inventory.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tool Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="toolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RFID Tag ID</FormLabel>
                      <FormControl>
                        <Input placeholder="T001" className="font-mono uppercase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tool Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Milwaukee M18 Drill" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Power Tools" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="issued">Issued</SelectItem>
                          <SelectItem value="missing">Missing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Link href="/tools">
                    <Button variant="ghost" type="button">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={createTool.isPending}>
                    {createTool.isPending ? "Saving..." : "Register Tool"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
