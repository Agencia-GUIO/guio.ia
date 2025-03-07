import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { MessageSquare, DollarSign, Gauge, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/hooks/use-toast";
const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))"];
export function DashboardPage() {
    const { toast } = useToast();
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
    const [costData, setCostData] = useState([{ date: "", value: 0 }]);
    const [statusDetails, setStatusDetails] = useState({
        totalConversations: 0,
        activePercentage: 0,
        inactivePercentage: 0,
        lastActivated: null,
        lastDeactivated: null,
    });
    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const { data: user, error } = await supabase.auth.getUser();
                if (error || !user) {
                    toast({
                        title: "Erro ao buscar Usuario",
                        description: error?.message,
                    });
                    return;
                }
                const today = new Date();
                const past30Days = new Date();
                past30Days.setDate(today.getDate() - 30);
                // Fetch messages data
                const { data: messages, error: messagesError } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("company_id", user.user?.user_metadata.company_id)
                    .gte("created_at", past30Days.toISOString())
                    .limit(5000);
                if (messagesError)
                    throw messagesError;

                const { count, errorCount } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true }) // Conta registros sem trazer os dados
                .eq("company_id", user.user?.user_metadata.company_id)
                .gte("created_at", past30Days.toISOString());
                if (errorCount)
                    throw errorCount;

                const totalConversas = count || 0;
                const custoTotal = (messages?.reduce((acc, m) => acc + (m.custo_tokens || 0), 0) || 0).toFixed(2);
                const mediaTokens = totalConversas > 0
                    ? Math.round(messages.reduce((acc, m) => acc + (m.tokens || 0), 0) /
                        totalConversas)
                    : 0;
                const respostas = messages?.filter((m) => m.role === "assistant").length || 0;
                const taxaResposta = totalConversas > 0
                    ? ((respostas / totalConversas) * 100).toFixed(1)
                    : 0;
                const messagesAssistant = messages?.filter((m) => m.role === "assistant" && m.tokens !== 0);
                const messagesAssistantCount = messagesAssistant.length;
                let somaInterval = 0;
                messagesAssistant.forEach((msg) => {
                    somaInterval += msg.response_interval;
                });
                // Exemplo de cálculo do tempo médio (em segundos)
                const tempoMedioResposta = Math.round(somaInterval / messagesAssistantCount) || 0;
                const custoPorConversa = totalConversas > 0
                    ? (Number(custoTotal) / totalConversas).toFixed(2)
                    : "0.00";
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
                    .eq("company_id", user.user?.user_metadata.company_id)
                    .gte("created_at", past30Days.toISOString())
                    .order("created_at", { ascending: false });
                if (customersError)
                    throw customersError;
                const active = customers?.filter((c) => c.ativacao).length || 0;
                const total = customers?.length || 0;
                const inactive = total - active;
                const activePercentage = total > 0 ? (active / total) * 100 : 0;
                const inactivePercentage = total > 0 ? (inactive / total) * 100 : 0;
                const lastActivated = customers?.find((c) => c.ativacao)?.created_at || null;
                const lastDeactivated = customers?.find((c) => !c.ativacao)?.created_at || null;
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
                const customer = messages?.filter((m) => m.role === "customer").length || 0;
                const assistant = messages?.filter((m) => m.role === "assistant").length || 0;
                setDistributionData([
                    { name: "Cliente", value: customer },
                    { name: "GUIO.AI", value: assistant },
                ]);
                // Calculate costs per day
                const costDataArray = Array.from({ length: 30 }, (_, i) => {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const messagesOnDate = messages?.filter((m) => new Date(m.created_at).toLocaleDateString() ===
                        date.toLocaleDateString());
                    return {
                        date: date.toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                        }),
                        value: (messagesOnDate?.length || 0) * 0.1, // Example cost calculation
                    };
                }).reverse();
                setCostData(costDataArray);
            }
            catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        }
        fetchDashboardData();
    }, []);
  console.log('DEBUG 01: CONVERSAS', dashboardData.totalConversas)

    const stats = [
        {
            title: "Total de Conversas",
            value: dashboardData.totalConversas.toLocaleString(),
            icon: MessageSquare,
            change: `${dashboardData.conversasChange === Infinity
                ? "Infinity"
                : dashboardData.conversasChange > 0
                    ? "+" + dashboardData.conversasChange
                    : dashboardData.conversasChange}%`,
            changeType: dashboardData.conversasChange >= 0 ? "positive" : "negative",
        },
        {
            title: "Custo Total",
            value: `$ ${dashboardData.custoTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
            })}`,
            icon: DollarSign,
            change: `${dashboardData.custoChange > 0 ? "+" : ""}${dashboardData.custoChange}%`,
            changeType: dashboardData.custoChange >= 0 ? "positive" : "negative",
        },
        {
            title: "Média de Tokens",
            value: dashboardData.mediaTokens.toLocaleString(),
            icon: Gauge,
            change: `${dashboardData.tokensChange > 0 ? "+" : ""}${dashboardData.tokensChange}%`,
            changeType: dashboardData.tokensChange >= 0 ? "positive" : "negative",
        },
        {
            title: "Taxa de Resposta",
            value: `${dashboardData.taxaResposta}%`,
            icon: MessageSquare,
            change: `${dashboardData.taxaChange > 0 ? "+" : ""}${dashboardData.taxaChange}%`,
            changeType: dashboardData.taxaChange >= 0 ? "positive" : "negative",
        },
        {
            title: "Tempo Médio de Resposta",
            value: `${dashboardData.tempoMedioResposta}s`,
            icon: Clock,
            change: `${dashboardData.tempoChange > 0 ? "+" : ""}${dashboardData.tempoChange}%`,
            changeType: dashboardData.tempoChange >= 0 ? "positive" : "negative",
        },
        {
            title: "Custo por Conversa",
            value: `$ ${dashboardData.custoPorConversa.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
            })}`,
            icon: DollarSign,
            change: `${dashboardData.custoConversaChange > 0 ? "+" : ""}${dashboardData.custoConversaChange}%`,
            changeType: dashboardData.custoConversaChange >= 0 ? "positive" : "negative",
        },
    ];
    return (_jsxs("div", { className: "space-y-8 p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold", children: "Dashboard" }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: stats.map((stat) => (_jsxs(Card, { className: "hover:border-primary/50", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: stat.title }), _jsx(stat.icon, { className: "h-4 w-4 text-primary" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stat.value }), _jsx("p", { className: cn("mt-1 text-xs", stat.changeType === "positive"
                                        ? "text-emerald-500"
                                        : "text-red-500"), children: "nos \u00FAltimos 30 dias" })] })] }, stat.title))) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-1 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Status da IA" }), _jsx(CardDescription, { children: "Distribui\u00E7\u00E3o de conversas ativas/inativas" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-col lg:flex-row h-auto lg:h-[300px] items-center justify-center gap-8", children: [_jsx("div", { className: "h-[200px] w-[200px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsx(PieChart, { children: _jsx(Pie, { data: statusData, cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 90, paddingAngle: 4, dataKey: "value", children: statusData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length], className: "stroke-background hover:opacity-80", strokeWidth: 2 }, `cell-${index}`))) }) }) }) }), _jsxs("div", { className: "flex-1 space-y-4 text-center lg:text-left", children: [_jsxs("p", { className: "text-lg font-semibold", children: ["Total de ", statusDetails.totalConversations, " conversas"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx("div", { className: "space-y-2", children: _jsxs("p", { className: "text-sm font-medium", children: ["Ativas: ", statusDetails.activePercentage.toFixed(1), "%"] }) }), _jsx("div", { className: "space-y-2", children: _jsxs("p", { className: "text-sm font-medium", children: ["Inativas: ", statusDetails.inactivePercentage.toFixed(1), "%"] }) })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Distribui\u00E7\u00E3o de Mensagens" }), _jsx(CardDescription, { children: "Cliente vs GUIO.AI" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-[250px] sm:h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: distributionData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { dataKey: "name", fontSize: 12, tickLine: false, axisLine: false }), _jsx(YAxis, { fontSize: 12, tickLine: false, axisLine: false }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "value", radius: [4, 4, 0, 0], children: distributionData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) })] }) }) }) })] }), _jsxs(Card, { className: "sm:col-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Custos por Dia" }), _jsx(CardDescription, { children: "Evolu\u00E7\u00E3o dos custos no per\u00EDodo" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-[250px] sm:h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: costData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { dataKey: "date", fontSize: 12, tickLine: false, axisLine: false }), _jsx(YAxis, { fontSize: 12, tickLine: false, axisLine: false }), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "value", stroke: COLORS[0], fill: COLORS[0], fillOpacity: 0.2 })] }) }) }) })] })] })] }));
}
