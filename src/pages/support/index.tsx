import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      const response = await axios.post(
        `https://hook.2be.com.br/webhook/send-email-support`,
        dataMessage, // Enviando o corpo da requisição
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );
      setLoading(false);
      setSubject("")
      setMessage("")
      setSuccess("E-mail enviada com sucesso!")
      // window.location.reload();
      return response;
    } catch (error: any) {}
  }

  return (
    <div className="flex flex-col items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Suporte</CardTitle>
          <CardDescription>Entre em contato conosco</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Assunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="resize-none"
            rows={5}
          />
          {success && <p className="text-green-500 text-sm">{success}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enviando..." : "Enviar Mensagem"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
