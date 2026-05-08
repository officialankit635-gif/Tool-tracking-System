import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Wrench, ArrowRightLeft, History, ScanBarcode, LogOut, PackageOpen, PackageMinus } from "lucide-react";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tools", label: "Tools Inventory", icon: Wrench },
    { href: "/issue", label: "Issue Tool", icon: PackageMinus },
    { href: "/return", label: "Return Tool", icon: PackageOpen },
    { href: "/transactions", label: "Transactions", icon: History },
    { href: "/scan", label: "RFID Scan", icon: ScanBarcode },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-md">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight text-lg">RFID Tracker</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${isActive ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
