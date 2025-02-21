import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
const formSchema = z.object({
    email: z.string().email("Email inválido"),
});
export function ResetPage() {
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });
    async function onSubmit(data) {
        setIsLoading(true);
        try {
            await resetPassword(data.email);
            toast({
                title: "Email enviado",
                description: "Verifique sua caixa de entrada para redefinir sua senha",
            });
            navigate("/auth/login");
        }
        catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao enviar email",
                description: error instanceof Error ? error.message : "Tente novamente",
            });
        }
        finally {
            setIsLoading(false);
        }
    }
    return (_jsxs("div", { className: "container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0", children: [_jsxs("div", { className: "relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r", children: [_jsx("div", { className: "absolute inset-0 bg-primary" }), _jsxs("div", { className: "relative z-20 flex items-center gap-2 text-lg font-medium", children: [_jsx(Bot, { className: "h-6 w-6" }), "GUIO.AI"] }), _jsx("div", { className: "relative z-20 mt-auto", children: _jsxs("blockquote", { className: "space-y-2", children: [_jsx("p", { className: "text-lg", children: "\"A seguran\u00E7a e facilidade de uso da plataforma GUIO.AI nos deu a confian\u00E7a necess\u00E1ria para digitalizar nosso atendimento.\"" }), _jsx("footer", { className: "text-sm", children: "Ana Paula" })] }) })] }), _jsx("div", { className: "p-4 lg:p-8 h-full flex items-center", children: _jsx("div", { className: "mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recuperar Senha" }), _jsx(CardDescription, { children: "Digite seu email para receber instru\u00E7\u00F5es de recupera\u00E7\u00E3o" })] }), _jsxs(CardContent, { children: [_jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, { type: "email", placeholder: "seu@email.com", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Enviando..."] })) : ("Enviar email") })] }) }), _jsx("div", { className: "mt-4 text-center text-sm", children: _jsx(Button, { variant: "link", className: "text-muted-foreground", onClick: () => navigate("/auth/login"), children: "Voltar para o login" }) })] })] }) }) })] }));
}
