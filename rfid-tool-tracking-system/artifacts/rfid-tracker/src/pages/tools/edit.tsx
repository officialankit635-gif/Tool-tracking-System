import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetTool, getGetToolQueryKey, useUpdateTool, getListToolsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const formSchema = z.object({
  toolId: z.string().min(2),
  name: z.string().min(2),
  category: z.string().min(2),
  status: z.enum(["available", "issued", "missing"]),
});

export default function EditTool() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const toolId = parseInt(id || "0", 10);

  const { data: tool, isLoading } = useGetTool(toolId, {
    query: { enabled: !!toolId, queryKey: getGetToolQueryKey(toolId) }
  });
  
  const updateTool = useUpdateTool();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toolId: "",
      name: "",
      category: "",
      status: "available",
    },
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (tool && initializedForId.current !== toolId) {
      initializedForId.current = toolId;
      form.reset({
        toolId: tool.toolId,
        name: tool.name,
        category: tool.category,
        status: tool.status,
      });
    }
  }, [tool, toolId, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateTool.mutate({ id: toolId, data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetToolQueryKey(toolId) });
        setLocation("/tools");
      },
    });
  };

  if (isLoading) return <Layout><div className="animate-pulse h-96 bg-muted rounded-xl" /></Layout>;
  if (!tool) return <Layout><div>Tool not found</div></Layout>;

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
            <h1 className="text-3xl font-bold tracking-tight">Edit Tool</h1>
            <p className="text-muted-foreground font-mono">{tool.toolId}</p>
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
                        <Input className="font-mono uppercase" {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  <Button type="submit" disabled={updateTool.isPending}>
                    {updateTool.isPending ? "Saving..." : "Save Changes"}
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
