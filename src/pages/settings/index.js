import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/hooks/use-toast";
export default function SettingsPage() {
    const { toast } = useToast();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    async function handlePasswordReset() {
        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem");
            return;
        }
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        setLoading(false);
        if (error) {
            setError(error.message);
        }
        else {
            toast({
                title: "Senha Alterada ",
                description: "A sua senha foi alterada com sucesso.",
            });
            setNewPassword("");
            setConfirmPassword("");
        }
    }
    return (_jsx("div", { className: "flex flex-col items-center p-6", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Configura\u00E7\u00F5es" }), _jsx(CardDescription, { children: "Gerencie suas configura\u00E7\u00F5es pessoais" })] }), _jsx(CardContent, { className: "flex flex-col gap-4", children: _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "w-full flex items-center gap-2", children: [_jsx(Lock, { size: 16 }), " Redefinir Senha"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Redefinir Senha" }), _jsx(DialogDescription, { children: "Insira sua nova senha e confirme-a para atualizar sua conta." })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { type: "password", placeholder: "Nova Senha", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "dark:text-cyan-50 text-neutral-950" }), _jsx(Input, { type: "password", placeholder: "Confirmar Nova Senha", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "dark:text-cyan-50 text-neutral-950" }), error && _jsx("p", { className: "text-red-500 text-sm", children: error })] }), _jsx(Button, { onClick: handlePasswordReset, disabled: loading, children: loading ? (_jsx(Loader2, { className: "animate-spin", size: 16 })) : ("Confirmar") })] })] }) })] }) }));
}
