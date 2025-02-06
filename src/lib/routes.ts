import { Home, MessageSquare, Settings, BarChart3, Users, FileText, Inbox, Lightbulb } from "lucide-react"

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
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    title: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    title: "Documents",
    icon: FileText,
    path: "/documents",
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
]