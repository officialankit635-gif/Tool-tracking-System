import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useIssueTool, getListToolsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { PackageMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  toolId: z.string().min(2, "RFID Tag ID is required"),
  userId: z.coerce.number().min(1, "User ID is required"),
});

export default function IssueTool() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const issueTool = useIssueTool();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toolId: "",
      userId: user?.id || 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    issueTool.mutate({ data: values }, {
      onSuccess: () => {
        toast({
          title: "Tool Issued Successfully",
          description: `Tool ${values.toolId} has been issued.`,
        });
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        form.resetField("toolId");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Issue Failed",
          description: error?.message || "Could not issue tool.",
        });
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto flex flex-col gap-6 pt-10">
        <div className="flex flex-col items-center text-center gap-4 mb-4">
          <div className="bg-primary/20 text-primary p-4 rounded-full">
            <PackageMinus className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Issue Tool</h1>
            <p className="text-muted-foreground">Scan or enter RFID to assign to an operator.</p>
          </div>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Issue Form</CardTitle>
            <CardDescription>Tool must be in "available" status.</CardDescription>
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
                        <Input placeholder="Scan or type (e.g. T001)" className="font-mono text-lg h-12 uppercase" autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operator ID</FormLabel>
                      <FormControl>
                        <Input type="number" className="font-mono h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={issueTool.isPending}>
                  {issueTool.isPending ? "PROCESSING..." : "ISSUE TOOL"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
