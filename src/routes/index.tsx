import { AuthGuard } from "@/components/auth-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { LoginPage } from "@/pages/auth/login";
import { RegisterPage } from "@/pages/auth/register";
import { ResetPage } from "@/pages/auth/reset";
import { ChatPage } from "@/pages/chat";
import { DashboardPage } from "@/pages/dashboard";
import { InsightsPage } from "@/pages/insights";
import { LeadsPage } from "@/pages/leads";
import SettingsPage from "@/pages/settings";
import SupportPage from "@/pages/support";
import { Navigate, Route, Routes } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth">
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="reset" element={<ResetPage />} />
      </Route>
      <Route
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/supports" element={<SupportPage />} />
      </Route>
    </Routes>
  );
}
