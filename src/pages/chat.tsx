import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  MessageSquare,
  MessagesSquare,
  Power,
  Search,
  Send as SendIcon,
  X,
  Bot,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { toast } from "@/components/hooks/use-toast";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Message = Database["public"]["Tables"]["messages"]["Row"];
type FilterStatus = "all" | "active" | "inactive";
type DateRange = { from: Date; to?: Date };

const datePresets = [
  { label: "Hoje", days: 0 },
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

export function ChatPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      if (!error) setCustomers(data);
      if (data) {
        if (data.length > 0 && !selectedCustomer) setSelectedCustomer(data[0]);
      }
    }
    fetchCustomers();
  }, [statusFilter, dateRange]);

  useEffect((): (() => Promise<"ok" | "timed out" | "error">) | undefined => {
    if (!selectedCustomer) return;

    async function fetchMessages() {
      const { data: user, error: errorAuth } = await supabase.auth.getUser();

      if (errorAuth || !user) {
        toast({
          title: "Erro ao buscar Usuario",
          description: errorAuth?.message,
        });
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("phone", selectedCustomer?.celular_cliente)
        .eq("company_id", user.user?.user_metadata.company_id)
        .order("created_at", { ascending: true });
      if (!error) setMessages(data);
    }
    fetchMessages();
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `phone=eq.${selectedCustomer.celular_cliente}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [selectedCustomer]);

  async function toggleCustomerActivation(customer: Customer) {
    setLoading(true);
    const { error } = await supabase
      .from("customers")
      .update({ ativacao: !customer.ativacao })
      .eq("id", customer.id);

    if (error) {
      console.error("Error toggling customer activation:", error);
    } else {
      setCustomers((current) =>
        current.map((c) =>
          c.id === customer.id ? { ...c, ativacao: !c.ativacao } : c
        )
      );
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer({ ...customer, ativacao: !customer.ativacao });
      }
    }
    setLoading(false);
  }

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedCustomer || !newMessage.trim()) return;

      const { data: user, error: errorAuth } = await supabase.auth.getUser();
      if (errorAuth) {
        return console.log("error");
      }

      const message = {
        message_content: newMessage,
        status: "sent",
        role: "assistant" as const,
        phone: selectedCustomer.celular_cliente,
        customer_id: selectedCustomer.id,
        company_id: user.user.user_metadata.company_id,
      };
      const { data, error } = await supabase
        .from("messages")
        .insert([message])
        .select();
      if (!error && data) setMessages((current) => [...current, data[0]]);
      setNewMessage("");
    },
    [newMessage, selectedCustomer]
  );

  function openWhatsApp(phone: string) {
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");
  }

  function selectDatePreset(days: number) {
    const to = new Date();
    const from = new Date();
    if (days > 0) {
      from.setDate(from.getDate() - days);
    } else {
      from.setHours(0, 0, 0, 0);
    }
    setDateRange({ from, to });
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex h-[calc(100vh-4rem)] bg-background">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 border-r bg-background lg:relative",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yy")} -{" "}
                            {format(dateRange.to, "dd/MM/yy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yy")
                        )
                      ) : (
                        <span>Período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    side="top"
                    sideOffset={16}
                  >
                    <div className="border-b p-2">
                      <div className="grid grid-cols-2 gap-2">
                        {datePresets.map((preset) => (
                          <Button
                            key={preset.days}
                            variant="outline"
                            size="sm"
                            onClick={() => selectDatePreset(preset.days)}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStatusFilter((current) =>
                      current === "all"
                        ? "active"
                        : current === "active"
                        ? "inactive"
                        : "all"
                    )
                  }
                >
                  {statusFilter === "all"
                    ? "Todos"
                    : statusFilter === "active"
                    ? "Ativos"
                    : "Inativos"}
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
                      selectedCustomer?.id === customer.id && "bg-accent"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {customer.nome}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {customer.celular_cliente}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        customer.ativacao ? "bg-primary" : "bg-muted"
                      )}
                    />
                  </button>
                ))
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum cliente encontrado
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <MessagesSquare className="h-6 w-6" />
      </Button>

      <div className="flex flex-1 flex-col">
        {selectedCustomer ? (
          <>
            <div className="flex items-center justify-between border-b bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">{selectedCustomer.nome}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.celular_cliente}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openWhatsApp(selectedCustomer.celular_cliente)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </Button>
                <Button
                  variant={
                    selectedCustomer.ativacao ? "destructive" : "default"
                  }
                  size="icon"
                  onClick={() => toggleCustomerActivation(selectedCustomer)}
                  disabled={loading}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 px-4">
              <div className="mx-auto max-w-3xl space-y-4 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.role === "customer"
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex max-w-[85%] flex-col gap-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {message.role === "customer"
                          ? selectedCustomer.nome
                          : "GUIO.AI"}
                      </span>
                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          message.role === "customer"
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent"
                        )}
                      >
                        <p className="break-words">{message.message_content}</p>
                        <p className="mt-1 text-[10px] opacity-70">
                          {new Date(message.created_at).toLocaleTimeString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                    </div>
                    {message.role === "customer" && (
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t bg-background p-4">
              <form onSubmit={sendMessage} className="mx-auto max-w-3xl">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="text-sm"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <SendIcon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Enviar</span>
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="mt-2 text-base font-semibold">
                Nenhum chat selecionado
              </h2>
              <p className="text-sm text-muted-foreground">
                Selecione uma conversa para começar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
