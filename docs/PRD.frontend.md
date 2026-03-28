# Product Requirements Document (PRD)

**CVS System - Frontend MVP**

## 1. Objetivo do Documento

Este documento redefine o PRD original com foco exclusivo no frontend do MVP.
O objetivo e transformar os requisitos de negocio em telas, fluxos, estados de interface e criterios de aceitacao para a aplicacao web em Nuxt.

Este PRD nao detalha regras internas de backend, banco de dados ou processamento de XML alem do necessario para a experiencia do usuario.

---

## 2. Visao do Produto no Frontend

O frontend do CVS System deve permitir que representantes comerciais:

- acompanhem receita bruta e faturamento em uma interface clara;
- cadastrem e consultem contratantes;
- enviem XMLs de notas fiscais com feedback visual de processamento;
- registrem faturamento manual associado aos contratantes;
- filtrem dados por periodo e cliente;
- exportem relatorios em CSV.

O produto deve priorizar clareza operacional, baixa curva de aprendizado e leitura rapida dos indicadores principais.

---

## 3. Publico-Alvo

- representantes comerciais que precisam controlar comissoes, notas fiscais e faturamento de contratantes;
- usuarios com familiaridade basica com planilhas, mas nao necessariamente com sistemas complexos de gestao;
- usuarios que podem operar tanto em desktop quanto em notebook durante rotina administrativa.

---

## 4. Objetivos do Frontend

### 4.1 Objetivos principais

- oferecer uma navegacao simples entre dashboard, lancamentos, contratantes e relatorios;
- reduzir ambiguidade entre "receita bruta" e "faturamento do contratante";
- tornar upload e revisao de dados tarefas rapidas e seguras;
- manter consistencia visual e estados previsiveis em toda a aplicacao.

### 4.2 Metricas de sucesso do frontend

- usuario consegue localizar os indicadores principais em menos de 10 segundos;
- usuario consegue cadastrar um contratante sem suporte externo;
- usuario consegue subir um XML e entender o status do processamento sem ambiguidade;
- usuario consegue exportar um relatorio aplicando filtros ativos;
- paginas principais carregam com estrutura visual completa sem saltos bruscos de layout.

---

## 5. Principios de UX

- simplicidade primeiro: cada tela deve ter um objetivo claro;
- linguagem financeira consistente: termos repetidos devem manter o mesmo significado em toda a interface;
- feedback imediato: uploads, erros, filtros e exportacoes devem ter retorno visual claro;
- orientacao por contexto: formularios e tabelas devem deixar evidente o que e automatico e o que depende de input manual;
- responsividade real: a aplicacao deve continuar funcional em viewport de tablet e mobile, mesmo que com simplificacoes visuais.

---

## 6. Escopo Funcional do Frontend

### 6.1 Modulos do MVP

- autenticacao basica;
- dashboard;
- gestao de lancamentos;
- gestao de contratantes;
- relatorios e exportacao;
- filtros globais ou por pagina, conforme contexto.

---

## 7. Arquitetura de Informacao

### 7.1 Navegacao principal

O frontend deve ter uma navegacao principal persistente com acesso para:

- Dashboard
- Lancamentos
- Contratantes
- Relatorios
- Sair

### 7.2 Hierarquia de telas

1. Login
2. Dashboard
3. Lancamentos
4. Contratantes
5. Relatorios

Cada area deve manter titulo, subtitulo contextual e acoes primarias visiveis acima da dobra sempre que possivel.

---

## 8. Requisitos por Tela

### 8.1 Login

**Objetivo**

Permitir acesso seguro e simples ao sistema.

**Elementos obrigatorios**

- campo de email ou nome de usuario;
- campo de senha;
- botao principal de entrada;
- estado de carregamento durante autenticacao;
- mensagem de erro para credenciais invalidas.

**Criterios de UX**

- foco inicial no primeiro campo;
- submissao por Enter;
- mensagens de erro claras e sem jargao tecnico.

### 8.2 Dashboard

**Objetivo**

Apresentar uma visao resumida do desempenho financeiro do periodo selecionado.

**Elementos obrigatorios**

- cards de resumo para receita bruta total, faturamento total informado, diferenca entre os dois valores e quantidade de lancamentos no periodo;
- grafico comparativo de receita versus faturamento;
- filtros por periodo;
- filtro opcional por contratante;
- area de estados vazios quando nao houver dados.

**Comportamentos**

- alteracao de filtros atualiza cards, grafico e tabela ou lista resumida associada;
- valores monetarios devem usar formatacao local;
- tooltips do grafico devem deixar claro a qual metrica cada valor pertence.

### 8.3 Lancamentos

**Objetivo**

Permitir upload, consulta e complemento manual dos registros financeiros.

**Elementos obrigatorios**

- acao principal de upload de XML;
- tabela ou lista de lancamentos;
- colunas minimas: data, contratante, receita bruta, impostos, faturamento informado e status;
- filtros por periodo e contratante;
- busca textual simples;
- acao para informar ou editar faturamento manual.

**Fluxo de upload**

1. Usuario seleciona um ou mais arquivos XML.
2. Interface valida formato permitido.
3. Sistema exibe estado de envio/processamento.
4. Resultado mostra sucesso parcial, total ou falha.
5. Lancamentos processados aparecem atualizados na listagem.

**Estados necessarios**

- arquivo invalido;
- upload em andamento;
- processamento concluido;
- erro de processamento;
- lista vazia;
- sem resultados para os filtros atuais.

### 8.4 Contratantes

**Objetivo**

Permitir cadastro e consulta dos contratantes vinculados aos lancamentos.

**Elementos obrigatorios**

- listagem de contratantes;
- formulario de criacao e edicao;
- campos minimos: nome, CPF/CNPJ, email e telefone;
- acao de busca por nome ou documento;
- validacoes visuais por campo.

**Comportamentos**

- CPF/CNPJ deve ter mascara ou formatacao amigavel;
- documento duplicado deve retornar erro compreensivel;
- formulario deve indicar claramente campos obrigatorios e opcionais.

### 8.5 Relatorios

**Objetivo**

Permitir leitura consolidada e exportacao dos dados filtrados.

**Elementos obrigatorios**

- filtros por periodo;
- filtro por contratante;
- resumo do conjunto filtrado;
- tabela simples com ganhos e perdas por cliente;
- botao de exportacao em CSV.

**Comportamentos**

- exportacao deve refletir exatamente os filtros visiveis;
- usuario deve receber feedback de inicio, sucesso ou falha da exportacao;
- quando nao houver dados, a tela deve orientar como ajustar os filtros.

---

## 9. Componentes e Padroes de Interface

### 9.1 Componentes globais esperados

- shell da aplicacao com navegacao principal;
- cabecalho de pagina;
- cards de KPI;
- tabela padrao com estados de loading, vazio e erro;
- formulario padrao com validacao inline;
- seletor de periodo;
- seletor de contratante;
- modal ou drawer para acoes rapidas;
- toasts ou alerts para feedback do sistema;
- confirmacao para acoes sensiveis, quando houver.

### 9.2 Padroes visuais

- tema claro, profissional e de facil leitura;
- contraste adequado entre texto, superficie e estados de destaque;
- espaco visual suficiente para leitura de valores monetarios;
- iconografia de apoio sem depender apenas de cor para transmitir estado;
- consistencia entre botoes primarios, secundarios e terciarios.

---

## 10. Estados de Interface

Todas as telas principais devem contemplar:

- loading inicial;
- carregamento parcial apos filtro ou acao;
- erro de requisicao;
- erro de validacao;
- estado vazio sem dados iniciais;
- estado vazio apos aplicacao de filtros;
- sucesso apos acao concluida.

Mensagens de sistema devem ser curtas, acionaveis e orientadas ao usuario.

---

## 12. Requisitos de Acessibilidade

- navegacao por teclado nas principais acoes;
- labels associadas corretamente aos campos;
- contraste minimo adequado para textos e controles;
- mensagens de erro vinculadas aos campos correspondentes;
- estados de foco visiveis;
- graficos com suporte complementar por texto ou legenda para nao depender apenas de leitura visual.

---

## 13. Integracoes e Dependencias de Backend

O frontend deve assumir integracao via API HTTP configurada por ambiente.

### 13.1 Dependencias minimas esperadas

- autenticacao simples;
- endpoint para listagem e cadastro de contratantes;
- endpoint para upload e processamento de XML;
- endpoint para listagem de lancamentos com filtros;
- endpoint para atualizacao do faturamento manual;
- endpoint para dados agregados do dashboard;
- endpoint para exportacao de relatorios em CSV.

### 13.2 Requisitos para contrato de API do ponto de vista do frontend

- respostas com estrutura consistente;
- mensagens de erro utilizaveis na interface;
- identificadores estaveis para tabelas e formularios;
- suporte a filtros por periodo e contratante;
- indicacao de status de processamento quando necessario.

---

## 14. Requisitos Nao Funcionais do Frontend

- performance percebida boa nas telas principais;
- hidratacao e navegacao sem regressao visual importante;
- separacao clara entre layout, paginas e componentes;
- configuracao de ambiente simples para desenvolvimento local;
- base preparada para evolucao incremental do design system.

---

## 15. Stack do Frontend

- framework principal: Nuxt 4;
- base de UI: PrimeVue 4;
- visualizacao de graficos: Chart.js 4;
- roteamento: Nuxt pages/router;
- tema e estilo global: CSS customizado com tema base consistente;
- configuracao de API: runtime config publico.

---

## 16. Criterios de Aceitacao do MVP Frontend

O MVP de frontend sera considerado pronto quando:

- houver fluxo funcional de login;
- dashboard exibir cards, grafico e filtros;
- usuario conseguir enviar XML e visualizar o resultado na area de lancamentos;
- usuario conseguir cadastrar, listar e localizar contratantes;
- usuario conseguir informar faturamento manual em um lancamento;
- usuario conseguir aplicar filtros de periodo e contratante nas areas relevantes;
- usuario conseguir exportar relatorio em CSV a partir da interface;
- telas principais funcionarem em desktop e tablet sem bloqueios;
- estados de loading, erro e vazio estiverem implementados nas paginas criticas.

---

## 17. Fases Sugeridas de Implementacao

### Fase 1

- estrutura base da aplicacao;
- layout principal;
- autenticacao;
- componentes globais;
- dashboard inicial com dados mockados.

### Fase 2

- pagina de contratantes;
- formularios com validacao;
- integracao com endpoints reais de leitura e escrita.

### Fase 3

- pagina de lancamentos;
- upload de XML;
- atualizacao de faturamento manual;
- estados de processamento.

### Fase 4

- relatorios;
- exportacao em CSV;
- refinamentos de responsividade e acessibilidade.

---

## 18. Resumo Executivo

O frontend do CVS System deve ser uma aplicacao web administrativa simples, confiavel e orientada a tarefas. O foco do MVP nao e profundidade analitica, mas sim permitir que o usuario visualize indicadores, registre informacoes com seguranca e execute as operacoes centrais do negocio com clareza.
