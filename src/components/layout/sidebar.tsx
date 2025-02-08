import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { routes } from "@/lib/routes";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown, LifeBuoy } from "lucide-react";
import { toAbsoluteUrl } from "@/public/utils/AssetsHelper";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const isActiveSupport = location.pathname === "/supports";

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center">
            <img
              src={toAbsoluteUrl("/src/public/media/Guio_01.png")}
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
          {/* <Separator className="mx-4" />
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
              Projects
            </h2>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start">
                <ChevronDown className="mr-2 h-4 w-4" />
                Design Engineering
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <ChevronDown className="mr-2 h-4 w-4" />
                Sales & Marketing
              </Button>
            </div>
          </div>
          <Separator className="mx-4" /> */}

          <div className="px-3 py-2">
            <div className="space-y-1">
              <Button
                key={"/supports"}
                variant={isActiveSupport ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActiveSupport &&
                    "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <LifeBuoy className="mr-2 h-4 w-4" />
                <Link to={"/supports"}>Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted" />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">shadcn</p>
              <p className="text-xs leading-none text-muted-foreground">
                m@example.com
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
