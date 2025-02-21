import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
const publicRoutes = ["/auth/login", "/auth/register", "/auth/reset"];
export function AuthGuard({ children }) {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (!isLoading) {
            const isPublicRoute = publicRoutes.includes(location.pathname);
            if (!user && !isPublicRoute) {
                navigate("/auth/login");
            }
            else if (user && isPublicRoute) {
                navigate("/");
            }
        }
    }, [user, isLoading, navigate, location.pathname]);
    if (isLoading) {
        return (_jsx("div", { className: "flex h-screen items-center justify-center", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    return children;
}
