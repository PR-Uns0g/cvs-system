<script setup lang="ts">
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

const chartMetrics = [
  {
    id: "contractor-revenue",
    label: "Receita do Contratante",
    color: "#2f7a4f",
    data: [284000, 341000, 296500, 362500],
  },
  {
    id: "my-revenue",
    label: "Meu Faturamento",
    color: "#152318",
    data: [14200, 17050, 14820, 18120],
  },
  {
    id: "taxes",
    label: "Montante de Impostos",
    color: "#2563a6",
    data: [35240, 42180, 36610, 44890],
  },
] as const;

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

const chartData = computed(() => ({
  labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
  datasets: chartMetrics
    .filter((metric) => selectedMetrics.value.includes(metric.id))
    .map((metric) => ({
      label: metric.label,
      backgroundColor: metric.color,
      borderRadius: 14,
      data: metric.data,
    })),
}));

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

const recentEntries = [
  {
    id: 1,
    date: "28 mar 2026",
    contractor: "Nova Era Distribuidora",
    contractorRevenue: "R$ 148.000",
    myRevenue: "R$ 7.400",
    status: "Conferido",
    statusTone: "success",
  },
  {
    id: 2,
    date: "27 mar 2026",
    contractor: "Comercial Horizonte",
    contractorRevenue: "R$ 82.000",
    myRevenue: "R$ 4.100",
    status: "Aguardando XML",
    statusTone: "warn",
  },
  {
    id: 3,
    date: "26 mar 2026",
    contractor: "Atacado São Jorge",
    contractorRevenue: "R$ 124.500",
    myRevenue: "R$ 6.225",
    status: "Processado",
    statusTone: "neutral",
  },
];
</script>

<template>
  <AppPageShell
    eyebrow="Visão geral"
    title="Dashboard"
    subtitle="Visualize seus ganhos com leitura rápida, sem distrações e com foco no que realmente importa para o representante."
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
        <strong>01 mar 2026 a 28 mar 2026</strong>
      </div>

      <div class="filter-strip__item">
        <span>Contratante</span>
        <strong>Todos os clientes</strong>
      </div>

      <div class="filter-strip__item filter-strip__item--status">
        <span>Atualização</span>
        <strong>Há 4 minutos</strong>
      </div>
    </section>

    <section class="panel-grid panel-grid--stats">
      <AppStatCard
        label="Receita do Contratante"
        value="R$ 1.284.000"
        detail="Valor total das notas lançadas pelos contratantes no período."
        icon="pi pi-building"
        tone="success"
      />
      <AppStatCard
        label="Meu Faturamento"
        value="R$ 64.200"
        detail="Seu ganho com comissão no período selecionado."
        icon="pi pi-wallet"
        tone="highlight"
      />
      <AppStatCard
        label="% de Comissão"
        :value="`${commissionRatioFormatter.format(5)}%`"
        detail="Percentual médio aplicado sobre a receita das notas."
        icon="pi pi-percentage"
      />
      <AppStatCard
        label="Lançamentos"
        value="42"
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

        <span class="pill">Comissão média de 5%</span>
      </div>

      <div class="metric-selector" role="group" aria-label="Métricas do gráfico">
        <button
          v-for="metric in chartMetrics"
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

      <div class="legend-row">
        <span
          v-for="metric in chartMetrics.filter((item) => selectedMetrics.includes(item.id))"
          :key="metric.id"
          class="legend-row__item"
        >
          <i class="legend-row__dot" :style="{ backgroundColor: metric.color }" />
          {{ metric.label }}
        </span>
      </div>
    </section>

    <section class="panel-card">
      <div class="section-header">
        <div>
          <p class="section-header__eyebrow">Recentes</p>
          <h2>Últimos lançamentos do período</h2>
        </div>

        <NuxtLink to="/relatorios" class="section-link">Gerar relatório</NuxtLink>
      </div>

      <div class="table-wrap">
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
</style>
