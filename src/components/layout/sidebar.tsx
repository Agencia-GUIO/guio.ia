import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { routes } from "@/lib/routes";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export function Sidebar({ className, setSidebarOpen }: SidebarProps) {
  const location = useLocation();
  const [dtaUser, setUser] = useState<User | null>();

  useEffect(() => {
    async function handleUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        setUser(null);
      }

      setUser(data.user);
    }
    handleUser();
  }, []);
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center">
            <img
              src="/media/Guio_01.png"
              alt=""
              className="h-7 w-7"
            />
          </div>
          <h1 className="text-lg font-semibold text-foreground">GUIO.AI</h1>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {routes.map((route) => {
                const isActive = location.pathname === route.path;
                return (
                  <Button
                    onClick={() => setSidebarOpen(false)}
                    key={route.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive &&
                        "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                    asChild
                  >
                    <Link to={route.path}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.title}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {dtaUser ? dtaUser.user_metadata.nome : "Unknow"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {dtaUser
                  ? dtaUser.email + " - " + dtaUser.user_metadata.role
                  : "Unknow"}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
