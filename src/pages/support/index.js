import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { supabase } from "@/lib/supabase";
export default function SupportPage() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    async function handleSubmit() {
        if (!subject || !message) {
            setSuccess("");
            setError("Por favor, preencha todos os campos.");
            return;
        }
        const { data, error } = await supabase.auth.getUser();
        if (data && !error) {
        }
        setLoading(true);
        const dataMessage = {
            client_email: data.user?.email,
            subject: subject,
            content: message,
        };
        try {
            const response = await axios.post(`https://hook.2be.com.br/webhook/send-email-support`, dataMessage, // Enviando o corpo da requisição
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            });
            setLoading(false);
            setSubject("");
            setMessage("");
            setError("");
            setSuccess("E-mail enviada com sucesso!");
            // window.location.reload();
            return response;
        }
        catch (error) { }
    }
    return (_jsx("div", { className: "flex flex-col items-center p-6", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Suporte" }), _jsx(CardDescription, { children: "Entre em contato conosco" })] }), _jsxs(CardContent, { className: "flex flex-col gap-4", children: [_jsx(Input, { type: "text", placeholder: "Assunto", value: subject, onChange: (e) => setSubject(e.target.value) }), _jsx(Textarea, { placeholder: "Digite sua mensagem...", value: message, onChange: (e) => setMessage(e.target.value), className: "resize-none", rows: 5 }), success && _jsx("p", { className: "text-green-500 text-sm", children: success }), error && _jsx("p", { className: "text-red-500 text-sm", children: error }), _jsx(Button, { onClick: handleSubmit, disabled: loading, children: loading ? "Enviando..." : "Enviar Mensagem" })] })] }) }));
}
