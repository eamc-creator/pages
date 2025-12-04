import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardData {
  history: Array<{ year: number; value: number; label: string }>;
  current_year: {
    year: number;
    average_index: number;
    respondents: number;
    distribution: Record<string, number>;
  };
  raw_data_2022: any[];
}

export default function Relatorios() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("2022");

  useEffect(() => {
    fetch("/data/dashboard_data_historico.json")
      .then((res) => res.json())
      .then((data) => {
        // Reconstruir dados no formato esperado
        const rawDataKey = `raw_data_${selectedYear}` as keyof typeof data;
        const municipios = data[rawDataKey] || [];
        const distribuicao = { A: 0, "B+": 0, B: 0, "C+": 0, C: 0 };
        municipios.forEach((m: any) => {
          distribuicao[m.faixa_apos_analise_rebaixamento as keyof typeof distribuicao]++;
        });
        const media = municipios.length > 0
          ? municipios.reduce((sum: number, m: any) => sum + m.nota_final, 0) / municipios.length
          : 0;
        
        setData({
          history: data.history,
          current_year: {
            year: parseInt(selectedYear),
            average_index: media,
            respondents: municipios.length,
            distribution: distribuicao
          },
          raw_data_2022: data.raw_data_2022
        });
        setLoading(false);
      })
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, [selectedYear]);

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Preparar dados para gráficos
  const distributionData = Object.entries(data.current_year.distribution).map(([faixa, count]) => ({
    name: faixa,
    value: count,
    color: getFaixaColor(faixa),
  }));

  const topMunicipios = [...data.raw_data_2022]
    .sort((a, b) => b.nota_final - a.nota_final)
    .slice(0, 10);

  const bottomMunicipios = [...data.raw_data_2022]
    .sort((a, b) => a.nota_final - b.nota_final)
    .slice(0, 10);

  // Dados para scatter plot (nota vs respostas pontuadas)
  const scatterData = data.raw_data_2022.map((m) => ({
    x: m.quantidade_respostas_pontuadas,
    y: m.nota_final,
    name: m.municipio,
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

  const handleDownloadReport = () => {
    // Criar um relatório simples em formato CSV
    const csvContent = [
      ["Relatório de Governança em TI - Santa Catarina"],
      ["Exercício 2022"],
      [""],
      ["Resumo Executivo"],
      ["Índice Médio", data.current_year.average_index.toFixed(4)],
      ["Municípios Respondentes", data.current_year.respondents],
      [""],
      ["Distribuição por Faixa"],
      ...Object.entries(data.current_year.distribution).map(([faixa, count]) => [
        `Faixa ${faixa}`,
        count,
      ]),
      [""],
      ["Municípios - Dados Completos"],
      ["Município", "Nota", "Faixa", "Respostas Pontuadas", "Total de Respostas"],
      ...data.raw_data_2022.map((m) => [
        m.municipio,
        m.nota_final.toFixed(4),
        m.faixa_apos_analise_rebaixamento,
        m.quantidade_respostas_pontuadas,
        m.quantidade_respostas,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_igov_ti_2022.csv";
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-primary">Relatórios</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Análises e visualizações avançadas dos dados de {selectedYear}
            </p>
          </div>

          <div className="flex items-center gap-4">
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

          <Button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="w-4 h-4" />
            Baixar Relatório (CSV)
          </Button>
        </div>

        <Tabs defaultValue="distribuicao" className="w-full">
          <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 h-auto rounded-none">
            <TabsTrigger
              value="distribuicao"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Distribuição
            </TabsTrigger>
            <TabsTrigger
              value="melhores"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Melhores Desempenhos
            </TabsTrigger>
            <TabsTrigger
              value="piores"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Menores Desempenhos
            </TabsTrigger>
            <TabsTrigger
              value="correlacao"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Correlação
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {/* Distribuição */}
            <TabsContent value="distribuicao" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Distribuição por Faixa (Pizza)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Distribuição por Faixa (Barras)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distributionData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={40} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Melhores Desempenhos */}
            <TabsContent value="melhores">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Top 10 Municípios com Melhor Desempenho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topMunicipios}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis type="number" domain={[0, 1]} />
                        <YAxis dataKey="municipio" type="category" width={200} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(4) : value} />
                        <Bar dataKey="nota_final" fill="#22c55e" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Menores Desempenhos */}
            <TabsContent value="piores">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>10 Municípios com Menor Desempenho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={bottomMunicipios}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis type="number" domain={[0, 1]} />
                        <YAxis dataKey="municipio" type="category" width={200} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(4) : value} />
                        <Bar dataKey="nota_final" fill="#f87171" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Correlação */}
            <TabsContent value="correlacao">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Correlação: Respostas Pontuadas vs Nota Final</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="x"
                          name="Respostas Pontuadas"
                          type="number"
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                        />
                        <YAxis
                          dataKey="y"
                          name="Nota Final"
                          type="number"
                          domain={[0, 1]}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          contentStyle={{
                            borderRadius: "0px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value) => (typeof value === "number" ? value.toFixed(4) : value)}
                        />
                        <Scatter
                          name="Municípios"
                          data={scatterData}
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Este gráfico mostra a relação entre o número de respostas pontuadas e a nota final
                    de cada município. Cada ponto representa um município.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
