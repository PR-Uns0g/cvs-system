# CVS System Frontend

Base do frontend do MVP descrito no PRD em [`docs/PRD.md`](./docs/PRD.md).

## Stack inicial

- Nuxt 4
- PrimeVue 4
- Chart.js 4
- Tema global com fonte `Manrope`

## Configuração

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir de `.env.example`. O frontend faz proxy para o backend Django ([Sistema-Gest-o-Financeira](https://github.com/Carlos777-programmer/Sistema-Gest-o-Financeira)); por padrão usa `http://127.0.0.1:8000`.

**Dois processos em desenvolvimento:** o Nuxt (`npm run dev`, porta 3000) só encaminha chamadas; o Django precisa estar rodando na porta 8000. Sem o backend, rotas como `/api/dashboard` e `/api/lancamentos` retornam erro de conexão.

**Autenticação:** o login grava JWT em cookies httpOnly (`cvs_access_token`, `cvs_refresh_token`). O browser fala só com o Nuxt (`/api/*`); o servidor Nuxt repassa `Authorization: Bearer` ao Django. CORS no Django não afeta esse fluxo (só importaria se o front chamasse `localhost:8000` direto).

No repositório do backend (pasta irmã `Sistema-Gest-o-Financeira`):

```bash
bash scripts/run_django_server.sh
```

## Desenvolvimento

```bash
npm run dev
```

## Build de produção

```bash
npm run build
```
