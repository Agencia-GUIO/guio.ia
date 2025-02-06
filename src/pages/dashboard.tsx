import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MessageSquare,
  Clock,
  Bot,
  Power,
  DollarSign,
  Gauge,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { supabase } from "@/lib/supabase";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))"];

// supabase.auth.signOut();

export function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalConversas: 0,
    custoTotal: 0,
    mediaTokens: 0,
    taxaResposta: 0,
    tempoMedioResposta: 0,
    custoPorConversa: 0,
    conversasChange: 0,
    custoChange: 0,
    tokensChange: 0,
    taxaChange: 0,
    tempoChange: 0,
    custoConversaChange: 0,
  });

  const [statusData, setStatusData] = useState([
    { name: "Ativa", value: 0 },
    { name: "Inativa", value: 0 },
  ]);

  const [distributionData, setDistributionData] = useState([
    { name: "Cliente", value: 0 },
    { name: "GUIO.AI", value: 0 },
  ]);

  const [costData, setCostData] = useState([
    { date: "01/02", value: 0 },
    { date: "02/02", value: 0 },
    { date: "03/02", value: 0 },
    { date: "04/02", value: 0 },
    { date: "05/02", value: 0 },
    { date: "06/02", value: 0 },
    { date: "07/02", value: 0 },
  ]);

  const [statusDetails, setStatusDetails] = useState({
    totalConversations: 0,
    activePercentage: 0,
    inactivePercentage: 0,
    lastActivated: null as Date | null,
    lastDeactivated: null as Date | null,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch messages data
        const { data: messages, error: messagesError } = await supabase
          .from("messages")
          .select("*");

        if (messagesError) throw messagesError;

        const totalConversas = messages?.length || 0;
        const custoTotal = (
          messages?.reduce((acc, m) => acc + (m.custo_tokens || 0), 0) || 0
        ).toFixed(2);
        const mediaTokens =
          Math.round(
            messages?.reduce((acc, m) => acc + (m.tokens || 0), 0) /
              totalConversas
          ) || 0;
        const respostas =
          messages?.filter((m) => m.role === "assistant").length || 0;
        const taxaResposta =
          totalConversas > 0
            ? ((respostas / totalConversas) * 100).toFixed(1)
            : 0;

        // Exemplo de cálculo do tempo médio (em segundos)
        const tempoMedioResposta = "0.0";
        const custoPorConversa =
          totalConversas > 0
            ? (Number(custoTotal) / totalConversas).toFixed(2)
            : "0.00";

        // Update dashboard stats
        setDashboardData({
          totalConversas,
          custoTotal: Number(custoTotal),
          mediaTokens,
          taxaResposta: Number(taxaResposta),
          tempoMedioResposta: Number(tempoMedioResposta),
          custoPorConversa: Number(custoPorConversa),
          conversasChange: Infinity,
          custoChange: 0,
          tokensChange: 0,
          taxaChange: 0,
          tempoChange: 0,
          custoConversaChange: 0,
        });

        // Fetch customers data
        const { data: customers, error: customersError } = await supabase
          .from("customers")
          .select("*")
          .order("created_at", { ascending: false });

        if (customersError) throw customersError;

        const active = customers?.filter((c) => c.ativacao).length || 0;
        const total = customers?.length || 0;
        const inactive = total - active;

        // Calculate percentages
        const activePercentage = total > 0 ? (active / total) * 100 : 0;
        const inactivePercentage = total > 0 ? (inactive / total) * 100 : 0;

        // Find last activation/deactivation dates
        const lastActivated =
          customers?.find((c) => c.ativacao)?.created_at || null;
        const lastDeactivated =
          customers?.find((c) => !c.ativacao)?.created_at || null;

        setStatusData([
          { name: "Ativa", value: active },
          { name: "Inativa", value: inactive },
        ]);

        setStatusDetails({
          totalConversations: total,
          activePercentage,
          inactivePercentage,
          lastActivated: lastActivated ? new Date(lastActivated) : null,
          lastDeactivated: lastDeactivated ? new Date(lastDeactivated) : null,
        });

        const customer =
          messages?.filter((m) => m.role === "customer").length || 0;
        const assistant =
          messages?.filter((m) => m.role === "assistant").length || 0;

        setDistributionData([
          { name: "Cliente", value: customer },
          { name: "GUIO.AI", value: assistant },
        ]);

        // Calculate costs per day
        const today = new Date();
        const costDataArray = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const messagesOnDate = messages?.filter(
            (m) =>
              new Date(m.created_at).toLocaleDateString() ===
              date.toLocaleDateString()
          );
          return {
            date: date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            }),
            value: (messagesOnDate?.length || 0) * 0.1, // Example cost calculation
          };
        }).reverse();

        setCostData(costDataArray);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total de Conversas",
      value: dashboardData.totalConversas.toLocaleString(),
      icon: MessageSquare,
      change: `${
        dashboardData.conversasChange === Infinity
          ? "Infinity"
          : dashboardData.conversasChange > 0
          ? "+" + dashboardData.conversasChange
          : dashboardData.conversasChange
      }%`,
      changeType: dashboardData.conversasChange >= 0 ? "positive" : "negative",
    },
    {
      title: "Custo Total",
      value: `R$ ${dashboardData.custoTotal.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      change: `${dashboardData.custoChange > 0 ? "+" : ""}${
        dashboardData.custoChange
      }%`,
      changeType: dashboardData.custoChange >= 0 ? "positive" : "negative",
    },
    {
      title: "Média de Tokens",
      value: dashboardData.mediaTokens.toLocaleString(),
      icon: Gauge,
      change: `${dashboardData.tokensChange > 0 ? "+" : ""}${
        dashboardData.tokensChange
      }%`,
      changeType: dashboardData.tokensChange >= 0 ? "positive" : "negative",
    },
    {
      title: "Taxa de Resposta",
      value: `${dashboardData.taxaResposta}%`,
      icon: MessageSquare,
      change: `${dashboardData.taxaChange > 0 ? "+" : ""}${
        dashboardData.taxaChange
      }%`,
      changeType: dashboardData.taxaChange >= 0 ? "positive" : "negative",
    },
    {
      title: "Tempo Médio de Resposta",
      value: `${dashboardData.tempoMedioResposta}s`,
      icon: Clock,
      change: `${dashboardData.tempoChange > 0 ? "+" : ""}${
        dashboardData.tempoChange
      }%`,
      changeType: dashboardData.tempoChange >= 0 ? "positive" : "negative",
    },
    {
      title: "Custo por Conversa",
      value: `R$ ${dashboardData.custoPorConversa.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      change: `${dashboardData.custoConversaChange > 0 ? "+" : ""}${
        dashboardData.custoConversaChange
      }%`,
      changeType:
        dashboardData.custoConversaChange >= 0 ? "positive" : "negative",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={cn(
                  "mt-1 text-xs",
                  stat.changeType === "positive"
                    ? "text-emerald-500"
                    : "text-red-500"
                )}
              >
                {stat.change} em relação ao período anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status da IA</CardTitle>
            <CardDescription>
              Distribuição de conversas ativas/inativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center gap-8">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="stroke-background hover:opacity-80"
                          strokeWidth={2}
                        />
                      ))}
                      <Label
                        content={({ viewBox: { cx, cy } }) => (
                          <>
                            <text
                              x={cx}
                              y={cy - 5}
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="fill-foreground text-2xl font-bold"
                            >
                              {statusDetails.totalConversations}
                            </text>
                            <text
                              x={cx}
                              y={cy + 15}
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="fill-muted-foreground text-xs"
                            >
                              Total
                            </text>
                          </>
                        )}
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[0] }}
                      />
                      <span className="text-sm font-medium">Ativas</span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-emerald-500">
                          {statusDetails.activePercentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ({statusData[0].value})
                        </p>
                      </div>
                      {statusDetails.lastActivated && (
                        <p className="text-xs text-muted-foreground">
                          Última:{" "}
                          {statusDetails.lastActivated.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[1] }}
                      />
                      <span className="text-sm font-medium">Inativas</span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-red-500">
                          {statusDetails.inactivePercentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ({statusData[1].value})
                        </p>
                      </div>
                      {statusDetails.lastDeactivated && (
                        <p className="text-xs text-muted-foreground">
                          Última:{" "}
                          {statusDetails.lastDeactivated.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    • Total de {statusDetails.totalConversations} conversas
                    monitoradas
                  </p>
                  <p>• {statusData[0].value} conversas ativas em andamento</p>
                  <p>• {statusData[1].value} conversas aguardando ativação</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Mensagens</CardTitle>
            <CardDescription>Cliente vs GUIO.AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Custos por Dia</CardTitle>
            <CardDescription>Evolução dos custos no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS[0]}
                    fill={COLORS[0]}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
