import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListTransactions } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ArrowRightLeft } from "lucide-react";

export default function Transactions() {
  const [actionFilter, setActionFilter] = useState<string>("all");

  const { data: transactions, isLoading } = useListTransactions(
    { actionType: actionFilter === "all" ? undefined : actionFilter as any }
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction Log</h1>
            <p className="text-muted-foreground">History of all tool issues and returns.</p>
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="issue">Issues</SelectItem>
              <SelectItem value="return">Returns</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="font-mono">Tool ID</TableHead>
                <TableHead>Tool Name</TableHead>
                <TableHead>Operator</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Loading transactions...</TableCell>
                </TableRow>
              ) : transactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell>
                </TableRow>
              ) : (
                transactions?.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        tx.actionType === "issue" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                      }`}>
                        <ArrowRightLeft className="h-3 w-3" />
                        {tx.actionType}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-medium">{tx.toolIdentifier}</TableCell>
                    <TableCell>{tx.toolName}</TableCell>
                    <TableCell className="font-medium">{tx.userName}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
