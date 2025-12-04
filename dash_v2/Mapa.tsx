import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ChoroplethMap from "@/components/ChoroplethMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function Mapa() {
  const [data, setData] = useState<any>(null);
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

  // Preparar dados para o mapa baseado no ano selecionado
  const rawDataKey = `raw_data_${selectedYear}` as keyof typeof data;
  const mapData = data[rawDataKey] || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-primary">Mapa Estadual</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Distribuição Geográfica do Índice i-Gov TI
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Exercício:</span>
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
        </div>

        <Card className="shadow-sm border-none bg-transparent">
          <CardContent className="p-0">
            <ChoroplethMap data={mapData} year={selectedYear} />
            
            {/* Legenda */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center bg-card p-4 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#22c55e]"></div>
                <span className="text-sm font-medium">A (Altamente Efetivo)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#84cc16]"></div>
                <span className="text-sm font-medium">B+ (Muito Efetivo)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#eab308]"></div>
                <span className="text-sm font-medium">B (Efetivo)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#facc15]"></div>
                <span className="text-sm font-medium">C+ (Em Adequação)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#f87171]"></div>
                <span className="text-sm font-medium">C (Inicial)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#e5e7eb] border border-gray-300"></div>
                <span className="text-sm font-medium">Sem Dados</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
