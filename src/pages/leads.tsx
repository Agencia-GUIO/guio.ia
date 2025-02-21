import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/hooks/use-toast";
import { DateRange } from "react-day-picker";

// type DateRange = { from: Date; to?: Date };
type Lead = {
  id: string;
  created_at: string;
  nome: string;
  celular_cliente: string;
  timer_is_active: boolean;
  ativacao: boolean;
  message_content: string;
  total_messages: number;
};

const PAGE_SIZE = 10;

export function LeadsPage() {
  // const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [leads, setLeads] = useState<Lead[]>([]);
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

      if (countError) throw countError;

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

      if (error) throw error;

      setLeads(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  function removePrefixAutomationFromMessage(message: string){
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
    link.setAttribute(
      "download",
      `leads_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Total de {totalLeads} {totalLeads === 1 ? "lead" : "leads"}
            {dateRange?.from && <> no período selecionado</>}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
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
                  <span>Filtrar por data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => setDateRange(range)}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={exportCSV} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status da IA</TableHead>
                  <TableHead>Total de Mensagens</TableHead>
                  <TableHead>Última Mensagem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : leads.length > 0 ? (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        {format(new Date(lead.created_at), "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                        {lead.nome}
                      </TableCell>
                      <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                        {lead.celular_cliente}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            lead.ativacao
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {lead.ativacao ? "Ativa" : "Inativa"}
                        </span>
                      </TableCell>
                      <TableCell>{lead.total_messages}</TableCell>
                      <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                        {removePrefixAutomationFromMessage(lead.message_content)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
