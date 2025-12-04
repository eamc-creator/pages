import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Users, Award, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  history: Array<{ year: number; value: number; label: string }>;
  current_year: {
    year: number;
    average_index: number;
    respondents: number;
    distribution: Record<string, number>;
  };
  raw_data_2020: any[];
  raw_data_2021: any[];
  raw_data_2022: any[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("2022");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/dashboard_data_historico.json")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Obter dados do ano selecionado
  const yearData = data.history.find((h) => h.year.toString() === selectedYear);
  const rawDataKey = `raw_data_${selectedYear}` as keyof DashboardData;
  const municipiosAno = data[rawDataKey] as any[];

  // Encontrar melhor e pior desempenho
  const melhorDesempenho = municipiosAno.reduce((prev, current) =>
    prev.nota_final > current.nota_final ? prev : current
  );
  const piorDesempenho = municipiosAno.reduce((prev, current) =>
    prev.nota_final < current.nota_final ? prev : current
  );

  // Calcular distribuição
  const distribuicao = { A: 0, "B+": 0, B: 0, "C+": 0, C: 0 };
  municipiosAno.forEach((m) => {
    distribuicao[m.faixa_apos_analise_rebaixamento as keyof typeof distribuicao]++;
  });

  // Preparar dados para gráficos
  const distribuicaoData = Object.entries(distribuicao).map(([faixa, count]) => ({
    name: faixa,
    value: count,
    color: getFaixaColor(faixa),
  }));

  function getFaixaColor(faixa: string): string {
    const colors: Record<string, string> = {
      A: "#22c55e",
      "B+": "#84cc16",
      B: "#eab308",
      "C+": "#facc15",
      C: "#f87171",
    };
    return colors[faixa] || "#e5e7eb";
  }

  // Calcular variação
  const yearIndex = data.history.findIndex((h) => h.year.toString() === selectedYear);
  const previousYear = yearIndex > 0 ? data.history[yearIndex - 1] : null;
  const variacao = previousYear
    ? ((yearData!.value - previousYear.value) / previousYear.value) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header com seletor de ano */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-primary">Visão Geral</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Panorama da Governança em TI nos Municípios de Santa Catarina
            </p>
          </div>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] bg-background border-2 border-primary/10 focus:ring-0 font-bold">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Índice Médio */}
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Índice Médio</p>
                  <p className="text-3xl font-bold text-primary mt-2">{yearData?.value.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Média estadual do i-Gov TI</p>
                </div>
                <Activity className="w-5 h-5 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          {/* Variação Anual */}
          <Card className={cn(
            "shadow-sm border-l-4",
            variacao < 0 ? "border-l-red-500" : "border-l-green-500"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Variação Anual</p>
                  <p className={cn(
                    "text-3xl font-bold mt-2",
                    variacao < 0 ? "text-red-500" : "text-green-500"
                  )}>
                    {variacao > 0 ? "+" : ""}{variacao.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {previousYear ? `Em relação a ${previousYear.label}` : "Sem comparação"}
                  </p>
                </div>
                {variacao < 0 ? (
                  <ArrowDownRight className="w-5 h-5 text-red-500" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Respondentes */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Respondentes</p>
                  <p className="text-3xl font-bold text-blue-500 mt-2">{municipiosAno.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Municípios participantes</p>
                </div>
                <Users className="w-5 h-5 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>

          {/* Melhor Desempenho */}
          <Card className="shadow-sm border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Melhor Desempenho</p>
                  <p className="text-lg font-bold text-green-600 mt-2">{melhorDesempenho.municipio}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-green-600">{melhorDesempenho.nota_final.toFixed(4)}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold">
                      {melhorDesempenho.faixa_apos_analise_rebaixamento}
                    </span>
                  </div>
                </div>
                <Award className="w-5 h-5 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Evolução Histórica */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Evolução Histórica (2020-2022)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip formatter={(value) => (typeof value === 'number' ? value.toFixed(4) : value)} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Faixa */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Distribuição por Faixa ({selectedYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribuicaoData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={40} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {distribuicaoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Estatístico */}
        <div className="grid gap-4 md:grid-cols-5">
          {Object.entries(distribuicao).reverse().map(([faixa, count]) => (
            <Card key={faixa} className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <div className="text-xs text-muted-foreground mt-1">Faixa {faixa}</div>
                  <div className="text-sm font-bold text-primary mt-2">
                    {((count / municipiosAno.length) * 100).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informações Adicionais */}
        <Card className="shadow-sm bg-secondary/30">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-bold text-foreground mb-2">Melhor Desempenho</h4>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{melhorDesempenho.municipio}</span> lidera com nota de{" "}
                  <span className="font-bold text-green-600">{melhorDesempenho.nota_final.toFixed(4)}</span> (Faixa{" "}
                  <span className="font-bold">{melhorDesempenho.faixa_apos_analise_rebaixamento}</span>)
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-2">Menor Desempenho</h4>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{piorDesempenho.municipio}</span> apresenta nota de{" "}
                  <span className="font-bold text-red-600">{piorDesempenho.nota_final.toFixed(4)}</span> (Faixa{" "}
                  <span className="font-bold">{piorDesempenho.faixa_apos_analise_rebaixamento}</span>)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="text-xs text-muted-foreground border-t border-border pt-4">
          <p>Fonte: TCE/SC</p>
          <p>Atualizado: 2023</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
