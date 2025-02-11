import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } else {
      toast({
        title: "Senha Alterada ",
        description: "A sua senha foi alterada com sucesso.",
      });

      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="flex flex-col items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>
            Gerencie suas configurações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Lock size={16} /> Redefinir Senha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Redefinir Senha</DialogTitle>
                <DialogDescription>
                  Insira sua nova senha e confirme-a para atualizar sua conta.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="Nova Senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirmar Nova Senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
              <Button onClick={handlePasswordReset} disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Confirmar"
                )}
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
