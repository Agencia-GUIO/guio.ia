import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, MessagesSquare, Power, Search, Send as SendIcon, X, User, } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/hooks/use-toast";
const datePresets = [
    { label: "Hoje", days: 0 },
    { label: "7 dias", days: 7 },
    { label: "30 dias", days: 30 },
    { label: "90 dias", days: 90 },
];
export function ChatPage() {
    const [customers, setCustomers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateRange, setDateRange] = useState();
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();
    useEffect(() => {
        async function fetchCustomers() {
            const { data: user, error: errorAuth } = await supabase.auth.getUser();
            if (errorAuth || !user) {
                toast({
                    title: "Erro ao buscar Usuario",
                    description: errorAuth?.message,
                });
            }
            let query = supabase
                .from("customers")
                .select("*")
                .eq("company_id", user.user?.user_metadata.company_id);
            if (statusFilter !== "all")
                query = query.eq("ativacao", statusFilter === "active");
            if (dateRange?.from) {
                query = query.gte("created_at", dateRange.from.toISOString());
                if (dateRange.to)
                    query = query.lte("created_at", dateRange.to.toISOString());
            }
            const { data, error } = await query.order("created_at", {
                ascending: false,
            });
            if (!error)
                setCustomers(data);
            if (data) {
                if (data.length > 0 && !selectedCustomer)
                    setSelectedCustomer(data[0]);
            }
        }
        fetchCustomers();
    }, [statusFilter, dateRange]);
    useEffect(() => {
        if (!selectedCustomer)
            return;
        async function fetchMessages() {
            const { data: user, error: errorAuth } = await supabase.auth.getUser();
            if (errorAuth || !user) {
                toast({
                    title: "Erro ao buscar Usuário",
                    description: errorAuth?.message,
                });
            }
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("phone", selectedCustomer?.celular_cliente)
                .eq("company_id", user.user?.user_metadata.company_id)
                .order("created_at", { ascending: true });
            if (!error)
                setMessages(data);
        }
        fetchMessages();
        const channel = supabase
            .channel("messages")
            .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `phone=eq.${selectedCustomer.celular_cliente}`,
        }, async (payload) => {
            setMessages((current) => [...current, payload.new]);
            const newMessage = payload.new;
            // Atualizar o campo last_message_answered no cliente correspondente
            if (newMessage.customer_id) {
                const lastMessageAnswered = !(newMessage.role === "customer");
                const { error } = await supabase
                    .from("customers")
                    .update({ last_message_answered: lastMessageAnswered })
                    .eq("id", newMessage.customer_id);
                if (error) {
                    console.error("Erro ao atualizar last_message_answered:", error);
                }
                else {
                    // Atualizar a lista de clientes localmente
                    setCustomers((current) => current.map((c) => c.id === String(newMessage.customer_id)
                        ? { ...c, last_message_answered: lastMessageAnswered }
                        : c));
                    if (selectedCustomer?.id === String(newMessage.customer_id)) {
                        setSelectedCustomer((prev) => prev
                            ? { ...prev, last_message_answered: lastMessageAnswered }
                            : prev);
                    }
                }
            }
        })
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [selectedCustomer]);
    async function toggleCustomerActivation(customer) {
        setLoading(true);
        const { error } = await supabase
            .from("customers")
            .update({
            ativacao: !customer.ativacao,
            timer_is_active: !customer.ativacao,
        })
            .eq("id", customer.id);
        if (error) {
            console.error("Error toggling customer activation:", error);
        }
        else {
            setCustomers((current) => current.map((c) => c.id === customer.id ? { ...c, ativacao: !c.ativacao } : c));
            if (selectedCustomer?.id === customer.id) {
                setSelectedCustomer({ ...customer, ativacao: !customer.ativacao });
            }
        }
        setLoading(false);
    }
    async function changeCustomer(customer) {
        setLoading(true);
        if (customer.last_message_answered == false) {
            const { error } = await supabase
                .from("customers")
                .update({
                last_message_answered: true,
            })
                .eq("id", customer.id);
            if (error) {
                console.error("Error toggling customer activation:", error);
            }
            else {
                setCustomers((current) => current.map((c) => c.id === customer.id ? { ...c, last_message_answered: true } : c));
                if (selectedCustomer?.id === customer.id) {
                    setSelectedCustomer({ ...customer, last_message_answered: true });
                }
            }
        }
        setSelectedCustomer(customer);
        setLoading(false);
    }
    const sendMessage = useCallback(async (e) => {
        e.preventDefault();
        if (!selectedCustomer || !newMessage.trim())
            return;
        const message = {
            message_content: newMessage,
            status: "sent",
            role: "assistant",
            phone: selectedCustomer.celular_cliente,
            company_id: selectedCustomer.company_id,
            customer_id: selectedCustomer.id,
        };
        const { data, error } = await supabase
            .from("messages")
            .insert([message])
            .select();
        if (!error && data) {
            setMessages((current) => [...current, data[0]]);
            try {
                const response = await fetch("https://hook.2be.com.br/webhook/guio-ai-wpp", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        event: "new_message",
                        data: data[0],
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Webhook error: ${response.status}`);
                }
            }
            catch (webhookError) {
                console.error("Erro ao chamar webhook:", webhookError);
            }
            setNewMessage("");
        }
    }, [newMessage, selectedCustomer]);
    function openWhatsApp(phone) {
        window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");
    }
    function selectDatePreset(days) {
        const to = new Date();
        const from = new Date();
        if (days > 0) {
            from.setDate(from.getDate() - days);
        }
        else {
            from.setHours(0, 0, 0, 0);
        }
        setDateRange({ from, to });
    }
    const filteredCustomers = customers.filter((customer) => customer.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    function removePrefixAutomationFromMessage(message) {
        const prefix = "*** AUTOMAÇÃO CUSTOMER ***";
        return message.replace(prefix, "").trim();
    }
    return (_jsxs("div", { className: "relative flex h-[calc(100vh-4rem)] bg-background", children: [_jsx("div", { className: cn("fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden", sidebarOpen ? "block" : "hidden"), onClick: () => setSidebarOpen(false) }), _jsx("div", { className: cn("fixed inset-y-0 left-0 z-50 w-80 border-r bg-background lg:relative", sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"), children: _jsxs("div", { className: "flex h-full flex-col", children: [_jsx("div", { className: "border-b p-4", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Buscar clientes...", className: "pl-8", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), searchTerm && (_jsx("button", { onClick: () => setSearchTerm(""), className: "absolute right-2 top-2.5 text-muted-foreground hover:text-foreground", children: _jsx(X, { className: "h-4 w-4" }) }))] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", className: cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground"), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), dateRange?.from ? (dateRange.to ? (_jsxs(_Fragment, { children: [format(dateRange.from, "dd/MM/yy"), " -", " ", format(dateRange.to, "dd/MM/yy")] })) : (format(dateRange.from, "dd/MM/yy"))) : (_jsx("span", { children: "Per\u00EDodo" }))] }) }), _jsxs(PopoverContent, { className: "w-auto p-0", align: "start", side: "top", sideOffset: 16, children: [_jsx("div", { className: "border-b p-2", children: _jsx("div", { className: "grid grid-cols-2 gap-2", children: datePresets.map((preset) => (_jsx(Button, { variant: "outline", size: "sm", onClick: () => selectDatePreset(preset.days), children: preset.label }, preset.days))) }) }), _jsx(Calendar, { initialFocus: true, mode: "range", defaultMonth: dateRange?.from, selected: dateRange, onSelect: setDateRange, numberOfMonths: 1, locale: ptBR })] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setStatusFilter((current) => current === "all"
                                                    ? "active"
                                                    : current === "active"
                                                        ? "inactive"
                                                        : "all"), children: statusFilter === "all"
                                                    ? "Todos"
                                                    : statusFilter === "active"
                                                        ? "Ativos"
                                                        : "Inativos" })] })] }) }), _jsx(ScrollArea, { className: "flex-1", children: _jsx("div", { className: "divide-y", children: filteredCustomers.length > 0 ? (filteredCustomers.map((customer) => {
                                    return (_jsx(_Fragment, { children: _jsxs("button", { onClick: () => {
                                                changeCustomer(customer);
                                                setSidebarOpen(false);
                                            }, className: cn("flex w-full max-w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent", selectedCustomer?.id === customer.id && "bg-accent", customer.last_message_answered ? "" : "bg-primary/10"), style: {
                                                wordBreak: "break-word",
                                                whiteSpace: "normal",
                                            }, children: [_jsx("div", { className: cn("flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-primary/10"), children: _jsx(User, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "font-medium break-words", children: customer.nome }), _jsx("div", { className: "truncate text-xs text-muted-foreground", children: customer.celular_cliente })] }), _jsx("span", { className: cn("text-xs font-medium", customer.last_message_answered
                                                        ? "text-green-600"
                                                        : "text-red-600"), children: customer.last_message_answered ? "Lido" : "Não lido" })] }, customer.id) }));
                                })) : (_jsx("div", { className: "py-4 text-center text-sm text-muted-foreground", children: "Nenhum cliente encontrado" })) }) })] }) }), _jsx(Button, { variant: "outline", size: "icon", className: "fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg lg:hidden", onClick: () => setSidebarOpen(!sidebarOpen), children: _jsx(MessagesSquare, { className: "h-6 w-6" }) }), _jsx("div", { className: "flex flex-1 flex-col p-4", children: selectedCustomer ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between border-b bg-background p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-primary/10", children: _jsx(User, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsxs("h2", { className: "text-lg sm:text-xl font-semibold", children: [selectedCustomer.nome, " \u2022", " ", selectedCustomer.ativacao ? "IA Ativada" : "IA Desativada"] }), _jsx("p", { className: "text-sm text-muted-foreground", children: selectedCustomer.celular_cliente })] })] }), _jsxs("div", { className: "flex gap-2 mt-4 sm:mt-0", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => openWhatsApp(selectedCustomer.celular_cliente), children: _jsx("svg", { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "currentColor", children: _jsx("path", { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" }) }) }), _jsx(Button, { variant: selectedCustomer.ativacao ? "default" : "destructive", size: "icon", onClick: () => toggleCustomerActivation(selectedCustomer), disabled: loading, children: _jsx(Power, { className: "h-4 w-4" }) })] })] }), _jsx(ScrollArea, { className: "flex-1 px-4", children: _jsx("div", { className: "mx-auto max-w-3xl space-y-4 py-4", children: messages.map((message) => (_jsx("div", { className: cn("flex gap-2", message.role === "customer"
                                        ? "justify-end"
                                        : "justify-start"), children: _jsxs("div", { className: "flex max-w-[85%] flex-col gap-1", children: [_jsx("span", { className: "text-xs font-medium text-muted-foreground", children: message.role === "customer"
                                                    ? selectedCustomer.nome
                                                    : "GUIO.AI" }), _jsx("div", { className: cn("rounded-lg px-3 py-2 text-sm", message.role === "customer"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-accent"), children: _jsx("p", { className: "break-words", children: removePrefixAutomationFromMessage(message.message_content) }) })] }) }, message.id))) }) }), _jsx("div", { className: "border-t bg-background p-4", children: _jsx("form", { onSubmit: sendMessage, className: "mx-auto max-w-3xl", children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Digite sua mensagem...", value: newMessage, onChange: (e) => setNewMessage(e.target.value), className: "text-sm" }), _jsxs(Button, { type: "submit", disabled: !newMessage.trim(), children: [_jsx(SendIcon, { className: "mr-2 h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Enviar" })] })] }) }) })] })) : (_jsxs("div", { className: "flex flex-1 flex-col items-center justify-center p-4 text-center", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Nenhum chat selecionado" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Selecione uma conversa para come\u00E7ar" })] })) })] }));
}
