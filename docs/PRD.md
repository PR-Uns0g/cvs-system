# 📄 Product Requirements Document (PRD)

**Sistema de Gestão de Notas Fiscais – MVP**

## 1. Visão Geral

O sistema será desenvolvido para representantes comerciais que precisam gerenciar notas fiscais e acompanhar faturamento, com foco na diferença entre **receita bruta da comissão** (valor da nota fiscal) e **faturamento dos contratantes** (valor informado manualmente).

Objetivo principal: fornecer uma plataforma simples que permita **upload, processamento básico e relatórios em CSV** de notas fiscais, diferenciando claramente receita e faturamento.

---

## 2. Público-Alvo

- Representantes comerciais que trabalham com comissões sobre vendas

---

## 3. Funcionalidades Principais

### 3.1 Dashboard

- Gráfico de barras simples (receita vs faturamento).
- Indicadores acumulados básicos.
- Período personalizável para análise.

### 3.2 Gestão de Registros

- Upload de XML de notas fiscais.
- Processamento básico de dados (extração de receita bruta e impostos principais).
- Inserção manual do faturamento do contratante.
- Armazenamento seguro em banco SQLite.

### 3.3 Gestão de Contratantes

- Cadastro simples (nome, CPF/CNPJ, contato).
- Listagem básica de contratantes.

### 3.4 Relatórios

- Exportação em CSV.
- Relatório simples de ganhos e perdas por cliente.

---

## 4. Estrutura de Dados

### 4.1 Usuário

| Campo  | Tipo   | Descrição                                |
| ------ | ------ | ---------------------------------------- |
| ID     | Int    | **Chave primária** - Identificador único |
| Nome   | String | Nome do usuário                          |
| E-mail | String | Email de login/autenticação              |
| Senha  | String | Hash da senha                            |

### 4.2 Contratante

| Campo    | Tipo   | Descrição                                |
| -------- | ------ | ---------------------------------------- |
| ID       | Int    | **Chave primária** - Identificador único |
| User_ID  | FK     | Referência ao usuário dono do registro   |
| Nome     | String | Nome do contratante                      |
| CPF/CNPJ | String | Identificador único do contratante       |
| E-mail   | String | Email de contato                         |
| Telefone | String | Telefone de contato                      |

### 4.3 Lançamento

| Campo                      | Tipo     | Descrição                                |
| -------------------------- | -------- | ---------------------------------------- |
| ID                         | Int      | **Chave primária** - Identificador único |
| User_ID                    | FK       | Referência ao usuário dono do registro   |
| Contratante_ID             | FK       | Referência ao contratante vinculado      |
| Receita Bruta              | Numérico | Valor extraído do XML da nota fiscal     |
| Data de Lançamento         | Data     | Preenchida automaticamente               |
| Valor dos Impostos         | JSON     | Objeto com impostos principais           |
| Faturamento do Contratante | Numérico | Definido manualmente pelo usuário        |

---

## 5. Funcionalidades de Filtros

- **Por período**: intervalo de datas personalizado.
- **Por contratante**: seleção simples de clientes.

---

## 6. Considerações Técnicas

- Parsing básico de XML de notas fiscais.
- Armazenamento em **SQLite** (sem migração para PostgreSQL).
- Exportação de relatórios apenas em CSV.
- Interface simples e responsiva.
- Uso de **JSON para impostos** (flexível, mas limitado a campos principais).

---

## 7. Requisitos Não Funcionais

- **Segurança**: autenticação básica (login simples).
- **Performance**: processamento eficiente de XMLs.
- **Usabilidade**: interface clara e simples.
- **Portabilidade**: compatível com diferentes sistemas operacionais.

---

## 8. Stack Tecnológica

### 🔹 Backend

- **Framework**: Django.
- **Banco de Dados**: SQLite.
- **Parsing de XML**: `xml.etree.ElementTree` (biblioteca nativa).
- **Exportação de relatórios**: CSV nativo do Python.
- **Autenticação**: Django Authentication (sem JWT no MVP).

### 🔹 Frontend

- **Framework principal**: Nuxt (Vue).
- **UI Library**: PrimeVue (uso básico de tabelas e formulários).
- **Gráficos**: Chart.js para dashboard simples.

### 🔹 Infraestrutura

- **Deploy manual**:
  - Backend no Heroku.
  - Frontend no Netlify.
- **Segurança**: HTTPS básico.
- **Versionamento**: Git + GitHub.

---

## 9. Arquitetura de Deploy e Comunicação

- **Repos separados**:
  - Backend (Django) → GitHub.
  - Frontend (Nuxt + Vue) → GitHub.

- **Fluxo de Deploy simplificado**:
  - Deploy manual no Heroku e Netlify.
  - API REST exposta em `/api/`.
  - Frontend consome API via HTTP/HTTPS.
  - Configuração mínima de CORS.
