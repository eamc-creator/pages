import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Municipio {
  municipio: string;
  codigo_ibge: number;
  nota_final: number;
  faixa_apos_analise_rebaixamento: string;
  quantidade_respostas: number;
  quantidade_respostas_pontuadas: number;
  pct_indice_apos_analise_rebaixamento: number;
}

type SortField = "municipio" | "nota_final" | "faixa_apos_analise_rebaixamento";
type SortOrder = "asc" | "desc";

const faixaOrder: Record<string, number> = {
  "A": 5,
  "B+": 4,
  "B": 3,
  "C+": 2,
  "C": 1
};

const faixaColors: Record<string, string> = {
  "A": "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
  "B+": "bg-[#84cc16]/10 text-[#84cc16] border-[#84cc16]/20",
  "B": "bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20",
  "C+": "bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20",
  "C": "bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20"
};

export default function AnaliseDetalhada() {
  const [data, setData] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [faixaFilter, setFaixaFilter] = useState<string>("todos");
  const [sortField, setSortField] = useState<SortField>("nota_final");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedYear, setSelectedYear] = useState<string>("2022");

  useEffect(() => {
    fetch("/data/dashboard_data_historico.json")
      .then((res) => res.json())
      .then((data) => {
        const rawDataKey = `raw_data_${selectedYear}` as keyof typeof data;
        setData(data[rawDataKey] || []);
        setLoading(false);
      })
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, [selectedYear]);

  // Filtrar e ordenar dados
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filtro por busca
    if (searchTerm) {
      result = result.filter((m) =>
        m.municipio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por faixa
    if (faixaFilter !== "todos") {
      result = result.filter((m) => m.faixa_apos_analise_rebaixamento === faixaFilter);
    }

    // Ordenação
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Para faixa, usar ordem customizada
      if (sortField === "faixa_apos_analise_rebaixamento") {
        aVal = faixaOrder[aVal] || 0;
        bVal = faixaOrder[bVal] || 0;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [data, searchTerm, faixaFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="border-b border-border pb-6">
          <h2 className="text-4xl font-bold tracking-tight text-primary">Análise Detalhada</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Dados completos dos municípios - Exercício {selectedYear}
          </p>
        </div>

        {/* Filtros */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar município..."
              className="pl-10 bg-background border-2 border-primary/10 focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="bg-background border-2 border-primary/10 focus:ring-0 font-bold">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>

          <Select value={faixaFilter} onValueChange={setFaixaFilter}>
            <SelectTrigger className="bg-background border-2 border-primary/10 focus:ring-0 font-bold">
              <SelectValue placeholder="Filtrar por faixa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Faixas</SelectItem>
              <SelectItem value="A">A - Altamente Efetivo</SelectItem>
              <SelectItem value="B+">B+ - Muito Efetivo</SelectItem>
              <SelectItem value="B">B - Efetivo</SelectItem>
              <SelectItem value="C+">C+ - Em Adequação</SelectItem>
              <SelectItem value="C">C - Inicial</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground flex items-center">
            <span className="font-bold text-foreground">{filteredData.length}</span>
            <span className="ml-2">de {data.length} municípios</span>
          </div>
        </div>

        {/* Tabela */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Municípios</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-bold text-foreground cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => toggleSort("municipio")}>
                        <div className="flex items-center gap-2">
                          Município
                          {sortField === "municipio" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 font-bold text-foreground cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => toggleSort("nota_final")}>
                        <div className="flex items-center justify-end gap-2">
                          Nota
                          {sortField === "nota_final" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 font-bold text-foreground cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => toggleSort("faixa_apos_analise_rebaixamento")}>
                        <div className="flex items-center justify-center gap-2">
                          Faixa
                          {sortField === "faixa_apos_analise_rebaixamento" && (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 font-bold text-foreground">Respostas</th>
                      <th className="text-right py-3 px-4 font-bold text-foreground">% Índice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((municipio, index) => (
                      <tr
                        key={municipio.codigo_ibge}
                        className={cn(
                          "border-b border-border hover:bg-secondary/50 transition-colors",
                          index % 2 === 0 ? "bg-background" : "bg-secondary/20"
                        )}
                      >
                        <td className="py-3 px-4 font-medium text-foreground">{municipio.municipio}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary">
                          {municipio.nota_final.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={cn(
                              "inline-block px-3 py-1 rounded-full text-xs font-bold border",
                              faixaColors[municipio.faixa_apos_analise_rebaixamento] || "bg-secondary text-foreground"
                            )}
                          >
                            {municipio.faixa_apos_analise_rebaixamento}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {municipio.quantidade_respostas_pontuadas}/{municipio.quantidade_respostas}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {(municipio.pct_indice_apos_analise_rebaixamento * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Resumo Estatístico */}
        <div className="grid gap-4 md:grid-cols-5">
          {Object.entries(faixaOrder).reverse().map(([faixa, _]) => {
            const count = filteredData.filter((m) => m.faixa_apos_analise_rebaixamento === faixa).length;
            const percentage = data.length > 0 ? ((count / data.length) * 100).toFixed(1) : "0";
            return (
              <Card key={faixa} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <div className="text-xs text-muted-foreground mt-1">Faixa {faixa}</div>
                    <div className="text-sm font-bold text-primary mt-2">{percentage}%</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
