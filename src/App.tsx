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
  return (
    <ThemeProvider defaultTheme="system" storageKey="guio-theme">
      <AuthProvider>
        <BrowserRouter>
          <AuthGuard>
            <Routes>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/reset" element={<ResetPage />} />
              <Route
                path="/"
                element={
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                }
              />
              <Route
                path="/chat"
                element={
                  <MainLayout>
                    <ChatPage />
                  </MainLayout>
                }
              />
              <Route
                path="/leads"
                element={
                  <MainLayout>
                    <LeadsPage />
                  </MainLayout>
                }
              />
              <Route
                path="/insights"
                element={
                  <MainLayout>
                    <InsightsPage />
                  </MainLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                }
              />

              <Route
                path="/supports"
                element={
                  <MainLayout>
                    <SupportPage />
                  </MainLayout>
                }
              />
            </Routes>
          </AuthGuard>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
