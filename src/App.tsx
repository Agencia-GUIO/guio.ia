import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/toaster";
import { AppRoutes } from "./routes";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="guio-theme">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
