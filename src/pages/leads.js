import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/hooks/use-toast";
const PAGE_SIZE = 10;
export function LeadsPage() {
    const [dateRange, setDateRange] = useState();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLeads, setTotalLeads] = useState(0);
    const { toast } = useToast();
    useEffect(() => {
        fetchLeads();
    }, [dateRange, page]);
    async function fetchLeads() {
        try {
            setLoading(true);
            const { data: user, error: errorAuth } = await supabase.auth.getUser();
            if (errorAuth && !user) {
                toast({
                    title: "Erro ao buscar Usuario",
                    description: errorAuth?.message,
                });
            }
            // First, get the total count
            let countQuery = supabase
                .from("customers")
                .select("id", { count: "exact" })
                .eq("company_id", user.user?.user_metadata.company_id);
            if (dateRange?.from) {
                countQuery = countQuery.gte("created_at", dateRange.from.toISOString());
                if (dateRange.to) {
                    countQuery = countQuery.lte("created_at", dateRange.to.toISOString());
                }
            }
            const { count: totalCount, error: countError } = await countQuery;
            if (countError)
                throw countError;
            setTotalLeads(totalCount || 0);
            setTotalPages(Math.ceil((totalCount || 0) / PAGE_SIZE));
            // Then get the paginated leads
            let query = supabase.rpc("get_customer_leads", {
                user_company_id: user?.user?.user_metadata.company_id,
            });
            if (dateRange?.from) {
                query = query.gte("created_at", dateRange.from.toISOString());
                if (dateRange.to) {
                    query = query.lte("created_at", dateRange.to.toISOString());
                }
            }
            // Add pagination
            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            query = query.range(from, to);
            const { data, error } = await query;
            if (error)
                throw error;
            setLeads(data || []);
        }
        catch (error) {
            toast({
                title: "Erro",
                description: String(error),
            });
        }
        finally {
            setLoading(false);
        }
    }
    function removePrefixAutomationFromMessage(message) {
        const prefix = "*** AUTOMAÇÃO CUSTOMER ***";
        return message.replace(prefix, "").trim();
    }
    function exportCSV() {
        const csvContent = [
            ["Name", "Phone", "Status", "Messages", "LastInteraction"],
            ...leads.map((lead) => [
                lead.nome,
                lead.celular_cliente,
                lead.timer_is_active ? "Active" : "Inactive",
                lead.total_messages,
                format(new Date(lead.created_at), "yyyy-MM-dd HH:mm:ss"),
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `leads_${format(new Date(), "yyyy-MM-dd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    return (_jsxs("div", { className: "space-y-8 p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4 w-full", children: [_jsxs("div", { className: "text-center sm:text-left w-full sm:w-auto", children: [_jsx("h1", { className: "text-3xl sm:text-4xl md:text-5xl font-bold", children: "Leads" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Total de ", totalLeads, " ", totalLeads === 1 ? "lead" : "leads", dateRange?.from && _jsx(_Fragment, { children: " no per\u00EDodo selecionado" })] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto", children: [_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "w-full sm:w-auto", children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), dateRange?.from ? (dateRange.to ? (_jsxs(_Fragment, { children: [format(dateRange.from, "dd/MM/yy"), " -", " ", format(dateRange.to, "dd/MM/yy")] })) : (format(dateRange.from, "dd/MM/yy"))) : (_jsx("span", { children: "Filtrar por data" }))] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "end", children: _jsx(Calendar, { initialFocus: true, mode: "range", defaultMonth: dateRange?.from, selected: dateRange, onSelect: setDateRange, numberOfMonths: 2, locale: ptBR }) })] }), _jsxs(Button, { onClick: exportCSV, className: "w-full sm:w-auto", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Exportar CSV"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Lista de Leads" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { className: "min-w-full", children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Data/Hora" }), _jsx(TableHead, { children: "Nome" }), _jsx(TableHead, { children: "Telefone" }), _jsx(TableHead, { children: "Status da IA" }), _jsx(TableHead, { children: "Total de Mensagens" }), _jsx(TableHead, { children: "\u00DAltima Mensagem" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "h-24 text-center", children: _jsx(Loader2, { className: "mx-auto h-6 w-6 animate-spin text-muted-foreground" }) }) })) : leads.length > 0 ? (leads.map((lead) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: format(new Date(lead.created_at), "dd/MM/yy HH:mm") }), _jsx(TableCell, { className: "whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]", children: lead.nome }), _jsx(TableCell, { className: "whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]", children: lead.celular_cliente }), _jsx(TableCell, { children: _jsx("span", { className: `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${lead.ativacao
                                                                ? "bg-primary/10 text-primary"
                                                                : "bg-muted text-muted-foreground"}`, children: lead.ativacao ? "Ativa" : "Inativa" }) }), _jsx(TableCell, { children: lead.total_messages }), _jsx(TableCell, { className: "whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]", children: removePrefixAutomationFromMessage(lead.message_content) })] }, lead.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: "h-24 text-center", children: "Nenhum lead encontrado" }) })) })] }) }), totalPages > 1 && (_jsxs("div", { className: "mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 w-full", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1, children: "Anterior" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["P\u00E1gina ", page, " de ", totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page === totalPages, children: "Pr\u00F3xima" })] }))] })] })] }));
}
