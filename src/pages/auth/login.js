import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
// import * from ''
const formSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});
export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    async function onSubmit(data) {
        setIsLoading(true);
        try {
            const { error } = await login(data.email, data.password);
            if (error)
                throw new Error(error);
            navigate("/");
        }
        catch (error) {
            toast({
                title: "Erro ao fazer login",
                description: error instanceof Error ? error.message : "Tente novamente",
            });
        }
        finally {
            setIsLoading(false);
        }
    }
    return (_jsxs("div", { className: "container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0", children: [_jsxs("div", { className: "relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r", children: [_jsx("div", { className: "absolute inset-0 bg-primary" }), _jsxs("div", { className: "relative z-20 flex items-center gap-2 text-lg font-medium", children: [_jsx("img", { src: "/media/Guio_01.png", alt: "", className: "h-8 w-8" }), "GUIO.AI"] }), _jsx("div", { className: "relative z-20 mt-auto", children: _jsxs("blockquote", { className: "space-y-2", children: [_jsx("p", { className: "text-lg", children: "Estrat\u00E9gias para um mundo cada vez mais digital" }), _jsx("footer", { className: "text-sm", children: " Rafael Riedel" })] }) })] }), _jsx("div", { className: "p-4 lg:p-8 h-full flex items-center", children: _jsx("div", { className: "mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Login" }), _jsx(CardDescription, { children: "Entre com seu email e senha para acessar sua conta" })] }), _jsxs(CardContent, { children: [_jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, { type: "email", placeholder: "seu@email.com", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "password", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Senha" }), _jsx(FormControl, { children: _jsx(Input, { type: "password", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Entrando..."] })) : ("Entrar") })] }) }), _jsx("div", { className: "mt-4 text-center text-sm", children: _jsx(Button, { variant: "link", className: "text-muted-foreground", onClick: () => navigate("/auth/reset"), children: "Esqueceu sua senha?" }) }), _jsxs("div", { className: "relative my-4", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("span", { className: "w-full border-t" }) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "Ou" }) })] }), _jsx(Button, { variant: "outline", className: "w-full", onClick: () => navigate("/auth/register"), children: "Criar nova conta" })] })] }) }) })] }));
}
