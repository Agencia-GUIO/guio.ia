import { Home, MessageSquare, Settings, Inbox, Lightbulb, LifeBuoy, } from "lucide-react";
export const routes = [
    {
        title: "Dashboard",
        icon: Home,
        path: "/",
    },
    {
        title: "Chat",
        icon: MessageSquare,
        path: "/chat",
    },
    {
        title: "Leads",
        icon: Inbox,
        path: "/leads",
    },
    {
        title: "Insights",
        icon: Lightbulb,
        path: "/insights",
    },
    {
        title: "Settings",
        icon: Settings,
        path: "/settings",
    },
    {
        title: "Support",
        icon: LifeBuoy,
        path: "/supports",
    },
];
