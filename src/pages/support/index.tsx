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

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    if (!subject || !message) {
      setSuccess("");
      setError("Por favor, preencha todos os campos.")
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setError("")
      setSuccess("Mensagem enviada com sucesso!")
      setSubject("");
      setMessage("");
      setLoading(false);
    }, 2000);
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
