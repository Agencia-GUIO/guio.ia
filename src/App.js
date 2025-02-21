import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { DashboardPage } from "@/pages/dashboard";
import { ChatPage } from "@/pages/chat";
import { LeadsPage } from "@/pages/leads";
import { InsightsPage } from "@/pages/insights";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { ResetPage } from "@/pages/auth/reset";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { Toaster } from "@/components/toaster";
import SettingsPage from "./pages/settings";
import SupportPage from "./pages/support";
function App() {
    return (_jsx(ThemeProvider, { defaultTheme: "system", storageKey: "guio-theme", children: _jsxs(AuthProvider, { children: [_jsx(BrowserRouter, { children: _jsx(AuthGuard, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/auth/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/auth/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/auth/reset", element: _jsx(ResetPage, {}) }), _jsx(Route, { path: "/", element: _jsx(MainLayout, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/chat", element: _jsx(MainLayout, { children: _jsx(ChatPage, {}) }) }), _jsx(Route, { path: "/leads", element: _jsx(MainLayout, { children: _jsx(LeadsPage, {}) }) }), _jsx(Route, { path: "/insights", element: _jsx(MainLayout, { children: _jsx(InsightsPage, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(MainLayout, { children: _jsx(SettingsPage, {}) }) }), _jsx(Route, { path: "/supports", element: _jsx(MainLayout, { children: _jsx(SupportPage, {}) }) })] }) }) }), _jsx(Toaster, {})] }) }));
}
export default App;
