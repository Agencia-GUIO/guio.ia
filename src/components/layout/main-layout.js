import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
export function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();
    async function handleLogout() {
        await logout();
        navigate("/auth/login");
    }
    return (_jsxs("div", { className: "flex min-h-screen flex-col lg:flex-row bg-background text-foreground", children: [_jsx("div", { className: cn("fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden", sidebarOpen ? "block" : "hidden"), onClick: () => setSidebarOpen(false) }), _jsx(Sidebar, { className: cn("fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform lg:static lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full"), setSidebarOpen: setSidebarOpen }), _jsxs("div", { className: "flex-1 flex flex-col w-full", children: [_jsxs(Button, { variant: "ghost", size: "icon", onClick: handleLogout, className: "hidden lg:flex", children: [_jsx(LogOut, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Sair" })] }), _jsxs("div", { className: "sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 lg:hidden", children: [_jsxs(Button, { variant: "outline", size: "icon", onClick: () => setSidebarOpen(!sidebarOpen), children: [_jsx(Menu, { className: "h-6 w-6" }), _jsx("span", { className: "sr-only", children: "Toggle sidebar" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("h1", { className: "text-lg font-semibold text-foreground", children: "GUIO.AI" }) }), _jsxs(Button, { variant: "ghost", size: "icon", onClick: handleLogout, className: "ml-auto", children: [_jsx(LogOut, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Sair" })] })] }), _jsx("main", { className: "flex-1 p-4 sm:p-6 md:p-8 w-full", children: children })] })] }));
}
