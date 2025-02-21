import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/hooks/use-toast";
import axios from "axios";
import { Bot, ChevronLeft, ChevronRight, Lightbulb, LineChart, Loader2, TrendingUp, } from "lucide-react";
import { CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer, BarChart, } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
const periods = [
    { value: 7, label: "7 dias" },
    { value: 15, label: "15 dias" },
    { value: 30, label: "30 dias" },
];
export function InsightsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState(7);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [insights, setInsights] = useState([]);
    const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
    // const [dtaSituation, setDtaSituation] = useState<any>();
    const [user, setUser] = useState(null);
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
            const { data: dataUser, error: errorAuth } = await supabase.auth.getUser();
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
            if (error)
                throw error;
            setInsights(data.map((item) => ({
                ...item,
                created_at: new Date(item.created_at),
            })));
        }
        catch (error) {
            toast({
                title: "Erro",
                description: String(error),
            });
        }
    }
    async function sendMessageWebHook(filteredMessages) {
        try {
            const response = await axios.post(`https://hook.2be.com.br/webhook/guioai-insights`, filteredMessages, // Enviando o corpo da requisição
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            });
            return response;
        }
        catch (error) { }
    }
    async function analyzeConversations() {
        if (!user)
            return;
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
            .select("*, customers:customers!messages_customer_id_fkey(id, nome, celular_cliente), companies(id, name)")
            .eq("company_id", authData.user?.user_metadata.company_id);
        if (!errorMessage && messages) {
            try {
                const filteredMessages = messages.map(({ status, tokens, custo_tokens, customer_id, company_id, ...rest }) => rest);
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
                setInsights(insightsData.map((item) => ({
                    ...item,
                    created_at: new Date(item.created_at),
                })));
                setCurrentInsightIndex(0);
                toast({
                    title: "Sucesso",
                    description: "Dados enviados com sucesso!!!",
                });
            }
            catch (error) {
                toast({
                    title: "Error",
                    description: "Erro ao envias os dados",
                });
            }
            finally {
                setIsAnalyzing(false);
            }
        }
        else {
            return console.log(`error`);
        }
    }
    const currentInsight = insights[currentInsightIndex];
    if (!insights.length) {
        return (_jsxs("div", { className: "space-y-8 p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "text-center sm:text-left w-full sm:w-auto", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold", children: "Insights" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "An\u00E1lise inteligente das suas conversas" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto", children: [_jsxs(Select, { value: selectedPeriod.toString(), onValueChange: (value) => setSelectedPeriod(Number(value)), children: [_jsx(SelectTrigger, { className: "w-full sm:w-[180px]", children: _jsx(SelectValue, { placeholder: "Selecione o per\u00EDodo" }) }), _jsx(SelectContent, { children: periods.map((period) => (_jsx(SelectItem, { value: period.value.toString(), children: period.label }, period.value))) })] }), _jsx(Button, { onClick: analyzeConversations, disabled: isAnalyzing || !user, className: "w-full sm:w-auto", children: isAnalyzing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), " ", "Analisando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Bot, { className: "mr-2 h-4 w-4" }), " Analisar Conversas"] })) })] })] }), _jsx(Card, { children: _jsx(CardContent, { className: "flex h-[250px] sm:h-[400px] items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(TrendingUp, { className: "mx-auto h-8 w-8 text-muted-foreground" }), _jsx("h2", { className: "mt-2 text-lg font-semibold", children: "Nenhuma an\u00E1lise encontrada" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Selecione um per\u00EDodo e clique em Analisar Conversas para come\u00E7ar" })] }) }) })] }));
    }
    const dtaSituation = Object.entries(currentInsight?.insights?.situations || []).map(([key, value]) => ({
        name: key,
        quantity: value?.quantity,
        percentage: value?.percentage,
    }));
    return (_jsxs("div", { className: "space-y-8 p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "text-center sm:text-left w-full sm:w-auto", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold", children: "Insights" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "An\u00E1lise inteligente das suas conversas" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto", children: [_jsxs(Select, { value: selectedPeriod.toString(), onValueChange: (value) => setSelectedPeriod(Number(value)), children: [_jsx(SelectTrigger, { className: "w-full sm:w-[180px]", children: _jsx(SelectValue, { placeholder: "Selecione o per\u00EDodo" }) }), _jsx(SelectContent, { children: periods.map((period) => (_jsx(SelectItem, { value: period.value.toString(), children: period.label }, period.value))) })] }), _jsx(Button, { onClick: analyzeConversations, disabled: isAnalyzing || !user, className: "w-full sm:w-auto", children: isAnalyzing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), " Analisando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Bot, { className: "mr-2 h-4 w-4" }), " Analisar Conversas"] })) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => {
                            setCurrentInsightIndex((i) => Math.min(insights.length - 1, i + 1));
                        }, disabled: currentInsightIndex === insights.length - 1, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["An\u00E1lise de", " ", format(currentInsight.created_at, "dd 'de' MMMM", {
                                locale: ptBR,
                            })] }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => setCurrentInsightIndex((i) => Math.max(0, i - 1)), disabled: currentInsightIndex === 0, children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Resumo da An\u00E1lise" }), _jsxs(CardDescription, { children: ["Per\u00EDodo: \u00FAltimos ", currentInsight.period, " dias"] })] }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-muted-foreground", children: currentInsight.insights.summary }), _jsxs("div", { className: "mt-6", children: [_jsx("h4", { className: "mb-4 text-sm font-medium", children: "Principais T\u00F3picos" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: currentInsight.insights.topics.map((topic, index) => (_jsx("div", { className: "rounded-md bg-secondary p-2 text-xs text-secondary-foreground", children: topic }, index))) })] }), _jsxs("div", { className: "mt-6", children: [_jsx("h4", { className: "mb-4 text-sm font-medium", children: "An\u00E1lise de Sentimento" }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "flex-1 space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Positivo" }), _jsxs("span", { children: [currentInsight.insights.sentiment.positive, "%"] })] }), _jsx("div", { className: "h-2 rounded-full bg-muted", children: _jsx("div", { className: "h-full rounded-full bg-emerald-500", style: {
                                                                        width: `${currentInsight.insights.sentiment.positive}%`,
                                                                    } }) })] }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Neutro" }), _jsxs("span", { children: [currentInsight.insights.sentiment.neutral, "%"] })] }), _jsx("div", { className: "h-2 rounded-full bg-muted", children: _jsx("div", { className: "h-full rounded-full bg-blue-500", style: {
                                                                        width: `${currentInsight.insights.sentiment.neutral}%`,
                                                                    } }) })] }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Negativo" }), _jsxs("span", { children: [currentInsight.insights.sentiment.negative, "%"] })] }), _jsx("div", { className: "h-2 rounded-full bg-muted", children: _jsx("div", { className: "h-full rounded-full bg-red-500", style: {
                                                                        width: `${currentInsight.insights.sentiment.negative}%`,
                                                                    } }) })] })] })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(LineChart, { className: "h-4 w-4 text-primary" }), _jsx(CardTitle, { children: "Descobertas" })] }) }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-2", children: currentInsight.insights.findings.map((finding, index) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("div", { className: "mt-1 h-1.5 w-1.5 rounded-full bg-primary" }), _jsx("span", { className: "text-sm", children: finding })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "h-4 w-4 text-primary" }), _jsx(CardTitle, { children: "Recomenda\u00E7\u00F5es" })] }) }), _jsx(CardContent, { children: _jsx("ul", { className: "space-y-4", children: currentInsight.insights.recommendations.map((recommendation, index) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsx("div", { className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary", children: index + 1 }), _jsx("span", { className: "text-sm", children: recommendation })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Distribui\u00E7\u00E3o de Situa\u00E7\u00F5es" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-[200px] sm:h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: dtaSituation, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted" }), _jsx(XAxis, { type: "number", stroke: "hsl(var(--muted-foreground))", fontSize: 12, tickLine: false, axisLine: false }), _jsx(YAxis, { dataKey: "name", type: "category", stroke: "hsl(var(--muted-foreground))", fontSize: 12, width: 150, tickLine: false, axisLine: false }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "quantity", fill: "hsl(var(--primary))", radius: [4, 4, 0, 0] })] }) }) }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Rela\u00E7\u00E3o Percentual de Situa\u00E7\u00F5es" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-[200px] sm:h-[300px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsx("div", { className: "mt-4", children: _jsxs("table", { className: "w-full border-collapse border border-gray-300", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-800 text-white", children: [_jsx("th", { className: "border border-gray-300 px-4 py-2", children: "Situa\u00E7\u00E3o" }), _jsx("th", { className: "border border-gray-300 px-4 py-2", children: "Quantidade" }), _jsx("th", { className: "border border-gray-300 px-4 py-2", children: "Porcentagem" })] }) }), _jsx("tbody", { children: dtaSituation.map((row, index) => (_jsxs("tr", { className: "border border-gray-300 text-center", children: [_jsx("td", { className: "border border-gray-300 px-4 py-2", children: row.name }), _jsx("td", { className: "border border-gray-300 px-4 py-2", children: row.quantity }), _jsx("td", { className: "border border-gray-300 px-4 py-2", children: row.percentage })] }, index))) })] }) }) }) }) })] })] }));
}
