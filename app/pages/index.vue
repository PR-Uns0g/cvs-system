<script setup lang="ts">
import type { LaunchEntry } from "~/types/api";

useHead({
  title: "Dashboard | CVS System",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const commissionRatioFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const { data: dashboardPayload, pending: isDashboardPending } = await useFetch(
  "/api/dashboard",
  {
    key: "dashboard-summary",
  },
);
const { data: launchesPayload, pending: isLaunchesPending } = await useFetch("/api/lancamentos", {
  key: "dashboard-launches",
});
const { data: contractorsPayload } = await useFetch("/api/contratantes", {
  key: "dashboard-contractors",
});

const contractorNameById = computed(() =>
  Object.fromEntries(
    asArray(contractorsPayload.value).map((raw) => {
      const c = normalizeContractor(raw);
      return [String(c.id), c.legalName] as const;
    }),
  ),
);

const dashboard = computed(() => normalizeDashboard(dashboardPayload.value));
const recentEntries = computed<LaunchEntry[]>(() =>
  asArray(launchesPayload.value)
    .map((item) => normalizeLaunch(item, contractorNameById.value))
    .slice(0, 5),
);

const launchCount = computed(() => asArray(launchesPayload.value).length);

const chartMetricDefs = [
  {
    id: "contractor-revenue",
    label: "Receita do Contratante",
    color: "#2f7a4f",
    pick: (record: Record<string, unknown>) =>
      parseMoneyNumber(
        record.faturamento_contratante ??
          record.receita_contratante ??
          record.valor_total ??
          record.contractorRevenue,
      ) ?? 0,
  },
  {
    id: "my-revenue",
    label: "Meu Faturamento",
    color: "#152318",
    pick: (record: Record<string, unknown>) =>
      parseMoneyNumber(
        record.valor_nf ?? record.meu_faturamento ?? record.comissao ?? record.myRevenue,
      ) ?? 0,
  },
  {
    id: "taxes",
    label: "Montante de Impostos",
    color: "#2563a6",
    pick: (record: Record<string, unknown>) => {
      const imp = record.impostos;
      if (record.total_impostos !== undefined && record.total_impostos !== null) {
        return parseMoneyNumber(record.total_impostos) ?? 0;
      }
      if (!imp || typeof imp !== "object") {
        return 0;
      }
      if (Array.isArray(imp)) {
        return imp.reduce<number>((acc, row) => {
          const r = row as Record<string, unknown>;
          return acc + (parseMoneyNumber(r.valor ?? r.value ?? 0) ?? 0);
        }, 0);
      }
      return Object.values(imp as Record<string, unknown>).reduce<number>(
        (acc, v) => acc + (parseMoneyNumber(v) ?? 0),
        0,
      );
    },
  },
] as const;

/** Four consecutive week buckets ending at the latest launch date (or today), from API launches only. */
const weeklySeriesFromLaunches = computed(() => {
  const items = asArray<Record<string, unknown>>(launchesPayload.value);
  if (!items.length) {
    return null;
  }

  const dates: Date[] = [];
  for (const record of items) {
    const raw = record.data_lancamento ?? record.data ?? record.date ?? record.created_at;
    const d = new Date(typeof raw === "string" || typeof raw === "number" ? raw : NaN);
    if (!Number.isNaN(d.getTime())) {
      dates.push(d);
    }
  }

  const anchor =
    dates.length > 0 ? new Date(Math.max(...dates.map((x) => x.getTime()))) : new Date();
  anchor.setHours(0, 0, 0, 0);

  const msWeek = 7 * 24 * 60 * 60 * 1000;
  const windowStart = new Date(anchor.getTime() - 3 * msWeek);
  windowStart.setHours(0, 0, 0, 0);

  const contractor = [0, 0, 0, 0];
  const myRev = [0, 0, 0, 0];
  const taxes = [0, 0, 0, 0];

  const pickContractor = chartMetricDefs[0]!.pick;
  const pickMy = chartMetricDefs[1]!.pick;
  const pickTaxes = chartMetricDefs[2]!.pick;

  for (const record of items) {
    const raw = record.data_lancamento ?? record.data ?? record.date ?? record.created_at;
    const d = new Date(typeof raw === "string" || typeof raw === "number" ? raw : NaN);
    let idx: number;
    if (Number.isNaN(d.getTime())) {
      idx = 3;
    } else if (d.getTime() < windowStart.getTime()) {
      idx = 0;
    } else {
      idx = Math.min(3, Math.floor((d.getTime() - windowStart.getTime()) / msWeek));
    }

    contractor[idx] = (contractor[idx] ?? 0) + pickContractor(record);
    myRev[idx] = (myRev[idx] ?? 0) + pickMy(record);
    taxes[idx] = (taxes[idx] ?? 0) + pickTaxes(record);
  }

  return {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    series: {
      "contractor-revenue": contractor,
      "my-revenue": myRev,
      taxes,
    } as Record<string, number[]>,
  };
});

const selectedMetrics = ref<string[]>(["contractor-revenue", "my-revenue"]);

const toggleMetric = (metricId: string) => {
  if (selectedMetrics.value.includes(metricId)) {
    if (selectedMetrics.value.length === 1) {
      return;
    }

    selectedMetrics.value = selectedMetrics.value.filter((id) => id !== metricId);
    return;
  }

  selectedMetrics.value = [...selectedMetrics.value, metricId];
};

const chartData = computed(() => {
  const weekly = weeklySeriesFromLaunches.value;
  if (!weekly) {
    return { labels: [] as string[], datasets: [] };
  }

  return {
    labels: weekly.labels,
    datasets: chartMetricDefs
      .filter((metric) => selectedMetrics.value.includes(metric.id))
      .map((metric) => ({
        label: metric.label,
        backgroundColor: metric.color,
        borderRadius: 14,
        data: weekly.series[metric.id],
      })),
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: { dataset: { label: string }; raw: number }) =>
          `${context.dataset.label}: ${currencyFormatter.format(context.raw)}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#5f6f5d",
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: "#5f6f5d",
        callback: (value: string | number) => currencyFormatter.format(Number(value)),
      },
      grid: {
        color: "rgba(95, 111, 93, 0.14)",
      },
    },
  },
};
</script>

<template>
  <AppPageShell
    eyebrow="Visão geral"
    title="Dashboard"
    subtitle="Visualize seus ganhos com leitura rápida, filtros e dados atualizados pela API."
  >
    <template #actions>
      <NuxtLink to="/lancamentos" class="page-shell__cta">
        <i class="pi pi-arrow-right" />
        <span>Ir para lançamentos</span>
      </NuxtLink>
    </template>

    <section class="panel-card filter-strip">
      <div class="filter-strip__item">
        <span>Período</span>
        <strong>Filtros da API</strong>
      </div>

      <div class="filter-strip__item">
        <span>Contratante</span>
        <strong>Todos os clientes</strong>
      </div>

      <div class="filter-strip__item filter-strip__item--status">
        <span>Atualização</span>
        <strong>{{ dashboard.updatedAt }}</strong>
      </div>
    </section>

    <section class="panel-grid panel-grid--stats">
      <AppStatCard
        label="Receita do Contratante"
        :value="isDashboardPending ? 'Carregando...' : dashboard.contractorRevenue"
        detail="Valor total das notas lançadas pelos contratantes no período."
        icon="pi pi-building"
        tone="success"
      />
      <AppStatCard
        label="Meu Faturamento"
        :value="isDashboardPending ? 'Carregando...' : dashboard.myRevenue"
        detail="Seu ganho com comissão no período selecionado."
        icon="pi pi-wallet"
        tone="highlight"
      />
      <AppStatCard
        label="% de Comissão"
        :value="`${commissionRatioFormatter.format(dashboard.commissionRatio)}%`"
        detail="Percentual médio aplicado sobre a receita das notas."
        icon="pi pi-percentage"
      />
      <AppStatCard
        label="Lançamentos"
        :value="dashboard.entriesCount"
        detail="Quantidade total de notas válidas dentro dos filtros ativos."
        icon="pi pi-check-circle"
      />
    </section>

    <section class="panel-card panel-card--chart">
      <div class="section-header">
        <div>
          <p class="section-header__eyebrow">Evolução</p>
          <h2>Selecione os dados que deseja comparar</h2>
        </div>

        <span class="pill">Dados consolidados</span>
      </div>

      <div v-if="isLaunchesPending" class="empty-state empty-state--panel">
        <i class="pi pi-spin pi-spinner" />
        <div>
          <strong>Carregando lançamentos...</strong>
          <p>O gráfico usa apenas dados reais retornados pela API.</p>
        </div>
      </div>

      <div v-else-if="!launchCount" class="empty-state empty-state--panel">
        <i class="pi pi-chart-bar" />
        <div>
          <strong>Nenhum dado para o gráfico ainda.</strong>
          <p>
            Importe notas em Lançamentos para ver a evolução semanal aqui. Os números do painel acima
            vêm do resumo da API; este gráfico não usa dados de exemplo.
          </p>
          <NuxtLink to="/lancamentos" class="empty-state__link">Ir para lançamentos</NuxtLink>
        </div>
      </div>

      <template v-else>
        <div class="metric-selector" role="group" aria-label="Métricas do gráfico">
          <button
            v-for="metric in chartMetricDefs"
            :key="metric.id"
            type="button"
            :class="['metric-chip', { 'is-active': selectedMetrics.includes(metric.id) }]"
            @click="toggleMetric(metric.id)"
          >
            <i class="metric-chip__dot" :style="{ backgroundColor: metric.color }" />
            <span>{{ metric.label }}</span>
          </button>
        </div>

        <div class="chart-wrap">
          <Chart type="bar" :data="chartData" :options="chartOptions" />
        </div>
      </template>
    </section>

    <section class="panel-card">
      <div class="section-header">
        <div>
          <p class="section-header__eyebrow">Recentes</p>
          <h2>Últimos lançamentos do período</h2>
        </div>

        <NuxtLink to="/relatorios" class="section-link">Gerar relatório</NuxtLink>
      </div>

      <div v-if="isLaunchesPending" class="empty-state empty-state--panel">
        <i class="pi pi-spin pi-spinner" />
        <div>
          <strong>Carregando lançamentos recentes...</strong>
        </div>
      </div>

      <div v-else-if="!recentEntries.length" class="empty-state">
        <i class="pi pi-inbox" />
        <div>
          <strong>Nenhum lançamento ainda.</strong>
          <p>Quando a API retornar registros, os últimos aparecem aqui.</p>
          <NuxtLink to="/lancamentos" class="empty-state__link">Importar XML em Lançamentos</NuxtLink>
        </div>
      </div>

      <div v-else class="table-wrap">
        <table class="app-data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Contratante</th>
              <th>Receita do Contratante</th>
              <th>Meu Faturamento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in recentEntries" :key="entry.id">
              <td>{{ entry.date }}</td>
              <td>{{ entry.contractor }}</td>
              <td>{{ entry.contractorRevenue }}</td>
              <td>{{ entry.myRevenue }}</td>
              <td>
                <span :class="['status-pill', `status-pill--${entry.statusTone}`]">
                  {{ entry.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </AppPageShell>
</template>

<style scoped>
.metric-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid rgba(20, 32, 19, 0.1);
  border-radius: 999px;
  background: #fff;
  color: var(--color-text);
  font-weight: 700;
  padding: 0.72rem 0.9rem;
}

.metric-chip.is-active {
  border-color: rgba(47, 122, 79, 0.22);
  background: rgba(47, 122, 79, 0.06);
  color: var(--color-brand-strong);
}

.metric-chip__dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
}

.empty-state--panel {
  border: 1px dashed rgba(20, 32, 19, 0.12);
  border-radius: 1.25rem;
  background: rgba(247, 250, 247, 0.65);
  padding: 1.35rem 1.25rem;
}

.empty-state__link {
  display: inline-block;
  margin-top: 0.65rem;
  font-weight: 700;
  color: var(--color-brand-strong);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}
</style>
