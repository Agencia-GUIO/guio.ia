import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { routes } from "@/lib/routes";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
export function Sidebar({ className, setSidebarOpen }) {
    const location = useLocation();
    const [dtaUser, setUser] = useState();
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
    return (_jsxs("div", { className: cn("flex flex-col", className), children: [_jsx("div", { className: "flex h-16 items-center border-b px-6", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex size-8 items-center justify-center", children: _jsx("img", { src: "/media/Guio_01.png", alt: "", className: "h-7 w-7" }) }), _jsx("h1", { className: "text-lg font-semibold text-foreground", children: "GUIO.AI" })] }) }), _jsx(ScrollArea, { className: "flex-1", children: _jsx("div", { className: "space-y-4 py-4", children: _jsx("div", { className: "px-3 py-2", children: _jsx("div", { className: "space-y-1", children: routes.map((route) => {
                                const isActive = location.pathname === route.path;
                                return (_jsx(Button, { onClick: () => setSidebarOpen(false), variant: isActive ? "secondary" : "ghost", className: cn("w-full justify-start", isActive &&
                                        "bg-primary/10 text-primary hover:bg-primary/20"), asChild: true, children: _jsxs(Link, { to: route.path, children: [_jsx(route.icon, { className: "mr-2 h-4 w-4" }), route.title] }) }, route.path));
                            }) }) }) }) }), _jsx("div", { className: "mt-auto border-t p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "size-8 rounded-full bg-muted" }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: dtaUser ? dtaUser.user_metadata.nome : "Unknow" }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: dtaUser
                                                ? dtaUser.email + " - " + dtaUser.user_metadata.role
                                                : "Unknow" })] })] }), _jsx(ThemeToggle, {})] }) })] }));
}
