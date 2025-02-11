import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, LineChart } from "recharts";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/hooks/use-toast";

import axios from "axios";
import { useAuth } from "@/lib/auth-context";
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  TrendingUp,
} from "lucide-react";

interface InsightAnalysis {
  id: string;
  created_at: Date;
  period: number;
  insights: {
    summary: string;
    topics: string[];
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
    findings: string[];
    recommendations: string[];
  };
}

const periods = [
  { value: 7, label: "7 dias" },
  { value: 15, label: "15 dias" },
  { value: 30, label: "30 dias" },
];

export function InsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<InsightAnalysis[]>([]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // Get the current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ id: user.id });
        fetchInsights();
      }
    });
  }, []);

  async function fetchInsights() {
    try {
      const { data: dataUser, error: errorAuth } =
        await supabase.auth.getUser();

      if (errorAuth && !dataUser) {
        toast({
          title: "Erro ao buscar Usuario",
          description: errorAuth?.message,
        });
      }
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("company_id", dataUser.user?.user_metadata.company_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInsights(
        data.map((item) => ({
          ...item,
          created_at: new Date(item.created_at),
        }))
      );
    } catch (error) {
      toast({
        title: "Erro",
        description: String(error),
      });
    }
  }

  async function sendMessageWebHook(filteredMessages: any) {
    try {
      const response = await axios.post(
        `https://hook.2be.com.br/webhook/guioai-insights`,
        filteredMessages, // Enviando o corpo da requisição
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );
    } catch (error: any) {}
  }

  async function analyzeConversations() {
    if (!user) return;
    setIsAnalyzing(true);

    const { data: authData, error } = await supabase.auth.getUser();

    if (error && !authData) {
      toast({
        title: "Erro ao buscar Usuario",
        description: error?.message,
      });
    }
    console.log("User Metadata:", authData.user?.user_metadata);
    console.log("Company ID:", authData.user?.user_metadata?.company_id);

    const { data: messages, error: errorMessage } = await supabase
      .from("messages")
      .select(
        "*, customers:customers!messages_customer_id_fkey(id, nome, celular_cliente), companies(id, name)"
      )
      .eq("company_id", authData.user?.user_metadata.company_id);

    if (!errorMessage && messages) {
      try {
        const filteredMessages = messages.map(
          ({
            status,
            tokens,
            custo_tokens,
            customer_id,
            company_id,
            ...rest
          }) => rest
        );

        await sendMessageWebHook(filteredMessages);

        toast({
          title: "Sucesso",
          description: "Dados enviados com sucesso!!!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Erro ao envias os dados",
        });
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      return console.log(`error`);
    }
  }

  const currentInsight = insights[currentInsightIndex];

  const situations_test_data = [
    { name: "Retomada de Cadastro", quantity: 32 },
    { name: "Problemas com CEMIG", quantity: 28 },
    { name: "Cadastro Duplicado", quantity: 15 },
    { name: "Dúvidas sobre o Serviço", quantity: 25 },
    { name: "Problemas de Acesso", quantity: 19 },
    { name: "Cadastros Finalizados", quantity: 45 },
  ];

  const totalQuantity = situations_test_data.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const formattedTestData = situations_test_data.map((item) => ({
    ...item,
    percentage: ((item.quantity / totalQuantity) * 100).toFixed(1) + "%",
  }));

  const [situationData, setSituationData] = useState(formattedTestData);

  if (!insights.length) {
    return (
      <div className="space-y-8 p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">Insights</h1>
            <p className="text-sm text-muted-foreground">
              Análise inteligente das suas conversas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Select
              value={selectedPeriod.toString()}
              onValueChange={(value) => setSelectedPeriod(Number(value))}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem
                    key={period.value}
                    value={period.value.toString()}
                  >
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={analyzeConversations}
              disabled={isAnalyzing || !user}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Analisando...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" /> Analisar Conversas
                </>
              )}
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="flex h-[250px] sm:h-[400px] items-center justify-center">
            <div className="text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="mt-2 text-lg font-semibold">
                Nenhuma análise encontrada
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecione um período e clique em Analisar Conversas para começar
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Insights</h1>
          <p className="text-sm text-muted-foreground">
            Análise inteligente das suas conversas
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Select
            value={selectedPeriod.toString()}
            onValueChange={(value) => setSelectedPeriod(Number(value))}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value.toString()}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={analyzeConversations}
            disabled={isAnalyzing || !user}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analisando...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" /> Analisar Conversas
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Análise</CardTitle>
            <CardDescription>
              Período: últimos {currentInsight.period} dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {currentInsight.insights.summary}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Situações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={situationData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={120}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="quantity"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
