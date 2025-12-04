# Análise do Dashboard e Dados de 2022

## Dashboard Original
- **URL**: https://govti-dash-ryjwwv2w.manus.space/
- **Período**: Exercícios 2020-2021 (Publicado em 2021-2022)
- **Tecnologia**: React/Vite com TailwindCSS
- **Estrutura**:
  - Cabeçalho CIASC
  - Botões de alternância entre exercícios 2020 e 2021
  - Cards com métricas principais (Índice Médio, Variação, Municípios Respondentes, Melhor Desempenho)
  - Gráfico de evolução temporal (2016-2021)
  - Distribuição de municípios por classificação (B+, B, C+, C, A)
  - Abas com desafios, fragilidades, soluções e municípios destaque

## Dados de 2022 (Publicados em 2023)
- **Arquivo**: calculo_iegm_2023_TCESC_i-GovTI.csv
- **Total de municípios**: 282
- **Ano de referência**: 2022 (ano_ref = 2023 indica publicação em 2023)
- **Estrutura**:
  - tribunal_id, tribunal, codigo_ibge, municipio
  - indicador (i-Gov TI)
  - quantidade_respostas, quantidade_respostas_pontuadas
  - nota_final, nota_ajustada_dentro_faixa
  - pct_indice_dentro_faixa, faixa
  - rebaixamentos, pct_indice_apos_analise_rebaixamento
  - faixa_apos_analise_rebaixamento
  - ano_ref

## Classificações Presentes nos Dados de 2022
- A (Excelente)
- B+ (Muito Bom)
- B (Bom)
- C+ (Em Fase de Adequação Superior)
- C (Em Fase de Adequação)

## Tarefa
Criar uma cópia do dashboard e adicionar os dados de 2022 (publicados em 2023), permitindo alternância entre os exercícios 2020, 2021 e 2022.
