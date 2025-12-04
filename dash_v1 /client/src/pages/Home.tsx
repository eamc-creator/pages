import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, TrendingUp, AlertCircle, Zap, BarChart3, ArrowUp, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface IEGMData {
  exercicio: string;
  ano_base: string;
  total_municipios: number;
  igov_ti_mean: number;
  igov_ti_min: number;
  igov_ti_max: number;
  classifications: Record<string, number>;
  municipalities?: Array<{
    nome: string;
    igov_ti: number;
    iegm?: number;
    classificacao: string;
  }>;
}

interface ConsolidatedData {
  evolution: Record<string, number>;
  data_2023?: IEGMData;
}

export default function Home() {
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedData | null>(null);
  const [currentYear, setCurrentYear] = useState<'2021' | '2022'>('2022');
  const [topMunicipalities, setTopMunicipalities] = useState<any[]>([]);
  const [bottomMunicipalities, setBottomMunicipalities] = useState<any[]>([]);

  useEffect(() => {
    // Carregar dados consolidados
    fetch('/iegm_consolidated_complete.json')
      .then(res => res.json())
      .then(data => {
        setConsolidatedData(data);
        
        // Ordenar municípios por i-Gov TI (usando dados de 2022)
        if (data.data_2023 && data.data_2023.municipalities) {
          const sorted = [...data.data_2023.municipalities].sort((a, b) => b.igov_ti - a.igov_ti);
          setTopMunicipalities(sorted.slice(0, 10));
          setBottomMunicipalities(sorted.slice(-10).reverse());
        }
      })
      .catch(err => console.error('Erro ao carregar dados:', err));
  }, []);

  const currentData = consolidatedData && currentYear === '2022' ? consolidatedData.data_2023 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CIASC</h1>
            <p className="text-sm text-slate-600">Governança em TI Municipal</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Exercício 2020-2022 (Publicado em 2021-2023)</p>
          </div>
        </div>
      </header>

      <main className="container py-12 space-y-12">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Situação da Governança em TI nos Municípios de Santa Catarina
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Uma análise abrangente dos desafios e oportunidades estratégicas para a modernização da gestão de Tecnologia da Informação nos municípios catarinenses, baseada nos dados do IEGM (Exercícios 2020-2022).
            </p>
          </div>
        </section>

        {/* Methodological Change Alert */}
        <section className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
          <div className="flex gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Mudança Metodológica em 2022</h3>
              <p className="text-amber-800 text-sm">
                A partir do Exercício 2022 (publicado em 2023), o IEGM adotou uma nova metodologia de cálculo do índice i-Gov TI. Isso resultou em uma mudança de escala de avaliação, não representando um retrocesso real na Governança de TI, mas sim uma revisão dos critérios de pontuação. Para análises comparativas, recomenda-se considerar a distribuição de municípios por classificação (A, B+, B, C+, C) em vez do valor absoluto do índice.
              </p>
            </div>
          </div>
        </section>

        {/* Year Selector */}
        <section className="flex gap-4 justify-center">
          <button
            onClick={() => setCurrentYear('2021')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              currentYear === '2021'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            Exercício 2021 (Metodologia Anterior)
          </button>
          <button
            onClick={() => setCurrentYear('2022')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              currentYear === '2022'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            Exercício 2022 (Nova Metodologia)
          </button>
        </section>

        {/* Key Metrics */}
        {currentData && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Índice Médio ({currentYear})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{currentData.igov_ti_mean.toFixed(4)}</div>
                <p className="text-sm text-slate-600 mt-2">Escala IEGM 2023</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Mudança Metodológica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">-30.5%</div>
                <p className="text-sm text-slate-600 mt-2">Nova escala (não representa retrocesso)</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-500" />
                  Municípios Respondentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{currentData.total_municipios}</div>
                <p className="text-sm text-slate-600 mt-2">De 295 municípios catarinenses</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  Melhor Desempenho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{currentData.igov_ti_max.toFixed(2)}</div>
                <p className="text-sm text-slate-600 mt-2">Urussanga (Classificação A)</p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Evolution Chart */}
        <section className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Evolução do Índice i-Gov TI</h3>
            <p className="text-slate-600 mt-1">Série histórica de 2016 a 2022 (com mudança metodológica em 2022)</p>
          </div>
          <Card className="bg-white shadow-md">
            <CardContent className="p-6">
              <img 
                src="/evolucao_igov_ti_sc_2016_2022.png" 
                alt="Gráfico de Evolução do Índice i-Gov TI" 
                className="w-full h-auto rounded-lg"
              />
              <p className="text-sm text-slate-600 mt-4 text-center">
                A série histórica mostra estabilidade no período pré-pandemia (2016-2019), uma leve queda em 2020 durante a pandemia, seguida de recuperação em 2021. Em 2022, a mudança metodológica do IEGM resultou em uma nova escala de avaliação. A análise comparativa deve focar na distribuição de municípios por classificação.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Distribution of Classifications */}
        {currentData && (
          <section className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Distribuição de Municípios por Classificação</h3>
              <p className="text-slate-600 mt-1">Exercício {currentYear}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(currentData.classifications)
                .sort(([a], [b]) => {
                  const order = { 'A': 0, 'B+': 1, 'B': 2, 'C+': 3, 'C': 4 };
                  return (order[a as keyof typeof order] || 999) - (order[b as keyof typeof order] || 999);
                })
                .map(([classification, count]) => {
                  const colors: Record<string, string> = {
                    'A': 'bg-green-100 border-green-300 text-green-900',
                    'B+': 'bg-blue-100 border-blue-300 text-blue-900',
                    'B': 'bg-cyan-100 border-cyan-300 text-cyan-900',
                    'C+': 'bg-yellow-100 border-yellow-300 text-yellow-900',
                    'C': 'bg-red-100 border-red-300 text-red-900'
                  };
                  return (
                    <Card key={classification} className={`border-2 ${colors[classification] || 'bg-gray-100'}`}>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold">{classification}</div>
                        <div className="text-2xl font-bold mt-2">{count}</div>
                        <p className="text-xs mt-2">municípios</p>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </section>
        )}

        {/* Tabs Section */}
        <section>
          <Tabs defaultValue="desafios" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100">
              <TabsTrigger value="desafios">Principais Desafios</TabsTrigger>
              <TabsTrigger value="fragilidades">Fragilidades Estruturais</TabsTrigger>
              <TabsTrigger value="solucoes">Soluções CIASC</TabsTrigger>
              <TabsTrigger value="municipios">Municípios Destaque</TabsTrigger>
            </TabsList>

            {/* Desafios Tab */}
            <TabsContent value="desafios" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      Planejamento Estratégico Deficiente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">
                      A ausência de um Plano Diretor de Tecnologia da Informação (PDTI) formalizado impede o alinhamento da TI com os objetivos de governo e a correta priorização de investimentos.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Segurança da Informação e LGPD
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">
                      Políticas de Segurança da Informação inadequadas e falta de conformidade plena com a Lei Geral de Proteção de Dados (LGPD) expõem dados públicos e do cidadão a riscos.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-yellow-500" />
                      Gestão de Serviços e Infraestrutura
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">
                      Infraestrutura de TI insuficiente ou desatualizadas, com gestão de serviços informal, comprometendo a qualidade e continuidade dos serviços digitais.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                      Impacto Pós-Pandemia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">
                      A urgência na implementação de soluções remotas e digitais ocorreu sem o devido planejamento e formalização de processos de governança críticos.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Fragilidades Tab */}
            <TabsContent value="fragilidades" className="space-y-4 mt-6">
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle>Estrutura Formal de Governança</CardTitle>
                  <CardDescription>Ausência de Comitê de Governança de TI (CGTI)</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">
                    Muitos municípios ainda não possuem um Comitê de Governança de TI formalizado ou um Plano Diretor de Tecnologia da Informação (PDTI) atualizado e aprovado. Isso impede a tomada de decisões estratégicas e a gestão de riscos adequada.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle>Conformidade Regulatória</CardTitle>
                  <CardDescription>LGPD e Políticas de Segurança Incipientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">
                    A pontuação média indica que as políticas de segurança da informação e a adequação à LGPD ainda são insuficientes. Muitos municípios carecem de processos formalizados para proteção de dados e gestão de incidentes.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle>Gestão de Serviços de TI (ITSM)</CardTitle>
                  <CardDescription>Falta de Processos Formalizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">
                    A ausência de processos formalizados para gestão de incidentes, problemas e mudanças (baseados em frameworks como ITIL) impacta a eficiência e a qualidade dos serviços digitais oferecidos ao cidadão.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Soluções Tab */}
            <TabsContent value="solucoes" className="space-y-4 mt-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-blue-900">Conectividade Integrada</CardTitle>
                  <CardDescription className="text-blue-800">Infraestrutura e Segurança</CardDescription>
                </CardHeader>
                <CardContent className="text-blue-900">
                  <p className="mb-4">
                    Solução de conectividade robusta e segura que oferece aos municípios acesso a infraestrutura de TI de classe empresarial, com redundância, segurança e conformidade regulatória.
                  </p>
                  <a 
                    href="https://www.ciasc.sc.gov.br/conectividade-integrada/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Saiba mais →
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-green-900">Dívida Ativa de Infrações de Trânsito</CardTitle>
                  <CardDescription className="text-green-800">Digitalização e Eficiência</CardDescription>
                </CardHeader>
                <CardContent className="text-green-900">
                  <p className="mb-4">
                    Sistema especializado para gestão de infrações de trânsito e dívida ativa, permitindo aos municípios modernizar a arrecadação e melhorar a eficiência operacional.
                  </p>
                  <p className="text-sm font-semibold">Disponível com dispensa de licitação (Lei 14.403)</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-purple-900">Módulo JARI</CardTitle>
                  <CardDescription className="text-purple-800">Julgamento de Recursos de Trânsito</CardDescription>
                </CardHeader>
                <CardContent className="text-purple-900">
                  <p className="mb-4">
                    Plataforma para julgamento de recursos de infrações de trânsito, agilizando processos e garantindo transparência e conformidade regulatória.
                  </p>
                  <p className="text-sm font-semibold">Integrado com o sistema de Dívida Ativa</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Municípios Destaque Tab */}
            <TabsContent value="municipios" className="space-y-6 mt-6">
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">Top 10 Municípios com Melhor i-Gov TI (2022)</h4>
                <div className="space-y-2">
                  {topMunicipalities.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-900 font-bold flex items-center justify-center text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{m.nome}</p>
                          <p className="text-xs text-slate-500">Classificação: {m.classificacao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{m.igov_ti.toFixed(4)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">Municípios que Necessitam de Atenção (2022)</h4>
                <div className="space-y-2">
                  {bottomMunicipalities.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-900 font-bold flex items-center justify-center text-sm">
                          {bottomMunicipalities.length - idx}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{m.nome}</p>
                          <p className="text-xs text-slate-500">Classificação: {m.classificacao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{m.igov_ti.toFixed(4)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-8 text-white text-center space-y-4">
          <h3 className="text-2xl font-bold">Próximos Passos</h3>
          <p className="text-slate-200 max-w-2xl mx-auto">
            O CIASC está posicionado para ser o parceiro estratégico dos municípios na jornada de elevação da maturidade em Governança de TI. Nossas soluções oferecem o respaldo da administração pública estadual com a vantagem da dispensa de licitação.
          </p>
          <div className="pt-4">
            <p className="text-sm text-slate-400">Entre em contato com o CIASC para conhecer as soluções disponíveis</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
        <div className="container text-center text-sm">
          <p>© 2025 CIASC - Centro de Informática e Automação do Estado de Santa Catarina</p>
          <p className="mt-2">Estudo de Governança em TI Municipal - Exercícios 2020-2022</p>
        </div>
      </footer>
    </div>
  );
}
