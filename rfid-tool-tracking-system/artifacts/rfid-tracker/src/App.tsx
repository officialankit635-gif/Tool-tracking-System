import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import ToolsList from "@/pages/tools/index";
import NewTool from "@/pages/tools/new";
import EditTool from "@/pages/tools/edit";
import Transactions from "@/pages/transactions";
import IssueTool from "@/pages/issue";
import ReturnTool from "@/pages/return";
import Scan from "@/pages/scan";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse">Loading...</div></div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function MainRouter() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      
      <Route path="/login">
        {user ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      
      <Route path="/register">
        {user ? <Redirect to="/dashboard" /> : <Register />}
      </Route>

      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/tools"><ProtectedRoute component={ToolsList} /></Route>
      <Route path="/tools/new"><ProtectedRoute component={NewTool} /></Route>
      <Route path="/tools/:id/edit"><ProtectedRoute component={EditTool} /></Route>
      <Route path="/transactions"><ProtectedRoute component={Transactions} /></Route>
      <Route path="/issue"><ProtectedRoute component={IssueTool} /></Route>
      <Route path="/return"><ProtectedRoute component={ReturnTool} /></Route>
      <Route path="/scan"><ProtectedRoute component={Scan} /></Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <TooltipProvider>
            <MainRouter />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
