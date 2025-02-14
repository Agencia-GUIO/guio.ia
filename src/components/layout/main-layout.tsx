import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background text-foreground">
      {/* Sidebar Overlay for Mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="hidden lg:flex"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sair</span>
        </Button>
        {/* Top Navbar for Mobile */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <div className="flex items-center gap-2">
            {/* <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <div className="text-primary">
                <Bot className="h-5 w-5" />
              </div>
            </div> */}
            <h1 className="text-lg font-semibold text-foreground">GUIO.AI</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="ml-auto"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
