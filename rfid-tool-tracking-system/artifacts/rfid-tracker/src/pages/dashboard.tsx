import { useGetStats } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground">Real-time overview of tool inventory and activity.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTools || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.availableTools || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issued</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.issuedTools || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Missing</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.missingTools || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentTransactions?.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:pb-0 last:border-0">
                    <div>
                      <p className="text-sm font-medium font-mono">{tx.toolIdentifier} - {tx.toolName}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.actionType === "issue" ? "Issued to" : "Returned by"} {tx.userName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                        tx.actionType === "issue" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
                      }`}>
                        {tx.actionType.toUpperCase()}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(tx.createdAt), "MMM d, HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
                {!stats?.recentTransactions?.length && (
                  <div className="text-sm text-muted-foreground text-center py-4">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Inventory by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.categoryBreakdown?.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{cat.count}</span>
                  </div>
                ))}
                {!stats?.categoryBreakdown?.length && (
                  <div className="text-sm text-muted-foreground text-center py-4">No categories</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
