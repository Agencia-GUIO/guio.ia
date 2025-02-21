import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/lib/theme-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "./dropdown-menu";
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", children: [_jsx(Sun, { className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" }), _jsx(Moon, { className: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" }), _jsx("span", { className: "sr-only", children: "Toggle theme" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => setTheme("light"), children: [_jsx(Sun, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Light" })] }), _jsxs(DropdownMenuItem, { onClick: () => setTheme("dark"), children: [_jsx(Moon, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Dark" })] }), _jsxs(DropdownMenuItem, { onClick: () => setTheme("system"), children: [_jsx(Laptop, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "System" })] })] })] }));
}
