import { useState, useEffect } from "react";

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
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/hooks/use-toast";

import axios from "axios";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  LineChart,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
  BarChart,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
    situations: {};
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
  // const [dtaSituation, setDtaSituation] = useState<any>();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const { toast } = useToast();

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
      return response;
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

        const data = await sendMessageWebHook(filteredMessages);

        if (!data) {
          throw new Error("Erro: Retorno de sendMessageWebHook é inválido!");
        }

        const { error: insertError } = await supabase.from("insights").insert([
          {
            company_id: authData.user?.user_metadata.company_id,
            insights: data.data.output.insights, // Armazena o retorno da função
            created_at: new Date().toISOString(),
            period: selectedPeriod,
          },
        ]);

        if (insertError) {
          console.error("Erro ao inserir no Supabase:", insertError);
          throw insertError;
        }

        const { data: insightsData, error: fetchError } = await supabase
          .from("insights")
          .select("*")
          .eq("company_id", authData.user?.user_metadata.company_id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Erro ao buscar insights:", fetchError);
          throw fetchError;
        }

        setInsights(
          insightsData.map((item) => ({
            ...item,
            created_at: new Date(item.created_at),
          }))
        );
        setCurrentInsightIndex(0);
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

  const dtaSituation = Object.entries(
    currentInsight?.insights?.situations || []
  ).map(([key, value]: [string, any]) => ({
    name: key,
    quantity: value?.quantity,
    percentage: value?.percentage,
  }));
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

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setCurrentInsightIndex((i) => Math.min(insights.length - 1, i + 1));
          }}
          disabled={currentInsightIndex === insights.length - 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm text-muted-foreground">
          Análise de{" "}
          {format(currentInsight.created_at, "dd 'de' MMMM", {
            locale: ptBR,
          })}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentInsightIndex((i) => Math.max(0, i - 1))}
          disabled={currentInsightIndex === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
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

            <div className="mt-6">
              <h4 className="mb-4 text-sm font-medium">Principais Tópicos</h4>
              <div className="grid grid-cols-2 gap-2">
                {currentInsight.insights.topics.map((topic, index) => (
                  <div
                    key={index}
                    className="rounded-md bg-secondary p-2 text-xs text-secondary-foreground"
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-4 text-sm font-medium">
                Análise de Sentimento
              </h4>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Positivo</span>
                    <span>{currentInsight.insights.sentiment.positive}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${currentInsight.insights.sentiment.positive}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Neutro</span>
                    <span>{currentInsight.insights.sentiment.neutral}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${currentInsight.insights.sentiment.neutral}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Negativo</span>
                    <span>{currentInsight.insights.sentiment.negative}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{
                        width: `${currentInsight.insights.sentiment.negative}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              <CardTitle>Descobertas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentInsight.insights.findings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-sm">{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <CardTitle>Recomendações</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {currentInsight.insights.recommendations.map(
                (recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </div>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Situações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dtaSituation} layout="vertical">
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
                    width={150}
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
      <Card>
        <CardHeader>
          <CardTitle>Relação Percentual de Situações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <div className="mt-4">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="border border-gray-300 px-4 py-2">
                        Situação
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Quantidade
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Porcentagem
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dtaSituation.map((row, index) => (
                      <tr
                        key={index}
                        className="border border-gray-300 text-center"
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          {row.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {row.quantity}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {row.percentage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
