<script setup lang="ts">
import type { Contractor, LaunchEntry } from "~/types/domain";

useHead({ title: "Dashboard | CVS System" });

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const commissionRatioFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const contractors = ref<Contractor[]>([]);
const selectedContractorId = ref("");
const isDashboardPending = ref(false);
const dashboard = {
  contractorRevenue: currencyFormatter.format(0),
  myRevenue: currencyFormatter.format(0),
  commissionRatio: 0,
  entriesCount: "0",
};
const selectedContractorLabel = computed(() =>
  selectedContractorId.value ? "Contratante selecionado" : "Todos os contratantes",
);
const recentEntries = ref<LaunchEntry[]>([]);
const launchCount = computed(() => recentEntries.value.length);
const chartMetricDefs = [
  { id: "contractor-revenue", label: "Receita do Contratante", color: "#2f7a4f" },
  { id: "my-revenue", label: "Meu Faturamento", color: "#152318" },
  { id: "taxes", label: "Montante de Impostos", color: "#2563a6" },
] as const;
const selectedMetrics = ref<string[]>(["contractor-revenue", "my-revenue"]);
const toggleMetric = (metricId: string) => {
  selectedMetrics.value = selectedMetrics.value.includes(metricId)
    ? selectedMetrics.value.filter((id) => id !== metricId)
    : [...selectedMetrics.value, metricId];
};
const chartData = { labels: [] as string[], datasets: [] };
const chartOptions = { responsive: true, maintainAspectRatio: false };
</script>

<template>
  <AppPageShell
    eyebrow="Visão geral"
    title="Dashboard"
    subtitle="Prévia visual do painel de faturamento e lançamentos."
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
        <AppPeriodSelector
          disabled
        />
      </div>

      <div class="filter-strip__item">
        <span>Contratante</span>
        <AppContractorSelector
          v-model="selectedContractorId"
          :contractors="contractors"
          disabled
        />
      </div>

      <div class="filter-strip__item filter-strip__item--status">
        <span>Resumo</span>
        <strong
          >{{ selectedContractorLabel }} ·
          {{ dashboard.entriesCount }} lançamento(s)</strong
        >
      </div>
    </section>

    <section class="panel-grid panel-grid--stats">
      <AppStatCard
        label="Receita dos Contratantes"
        :value="
          isDashboardPending ? 'Carregando...' : dashboard.contractorRevenue
        "
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

      <div v-if="isDashboardPending" class="empty-state empty-state--loading">
        <i class="pi pi-spin pi-spinner" />
        <div>
          <strong>Carregando lançamentos...</strong>
          <p>Os dados do gráfico estarão disponíveis quando o serviço for reconstruído.</p>
        </div>
      </div>

      <div v-else-if="!launchCount" class="empty-state empty-state--void">
        <i class="pi pi-chart-bar" />
        <div>
          <strong>Nenhum dado para o gráfico ainda.</strong>
          <p>
            Os dados deste painel não estão conectados a uma fonte de dados.
          </p>
          <NuxtLink to="/lancamentos" class="empty-state__link"
            >Ir para lançamentos</NuxtLink
          >
        </div>
      </div>

      <template v-else>
        <div
          class="metric-selector"
          role="group"
          aria-label="Métricas do gráfico"
        >
          <button
            v-for="metric in chartMetricDefs"
            :key="metric.id"
            type="button"
            :class="[
              'metric-chip',
              { 'is-active': selectedMetrics.includes(metric.id) },
            ]"
            @click="toggleMetric(metric.id)"
          >
            <i
              class="metric-chip__dot"
              :style="{ backgroundColor: metric.color }"
            />
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

        <NuxtLink to="/relatorios" class="section-link"
          >Gerar relatório</NuxtLink
        >
      </div>

      <div v-if="isDashboardPending" class="empty-state empty-state--loading">
        <i class="pi pi-spin pi-spinner" />
        <div>
          <strong>Carregando lançamentos recentes...</strong>
        </div>
      </div>

      <div
        v-else-if="!recentEntries.length"
        class="empty-state empty-state--void"
      >
        <i class="pi pi-inbox" />
        <div>
          <strong>Nenhum lançamento ainda.</strong>
          <p>Os lançamentos recentes aparecerão aqui após a reconexão do serviço.</p>
          <NuxtLink to="/lancamentos" class="empty-state__link"
            >Importar XML em Lançamentos</NuxtLink
          >
        </div>
      </div>

      <div v-else class="table-wrap">
        <table class="app-data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Contratante</th>
              <th>Receita dos Contratantes</th>
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
                <span
                  :class="['status-pill', `status-pill--${entry.statusTone}`]"
                >
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

.empty-state__link {
  display: inline-block;
  margin-top: 0.65rem;
  font-weight: 700;
  color: var(--color-brand-strong);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}
</style>
