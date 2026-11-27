<script setup lang="ts">
const props = defineProps<{
  pending: boolean;
  launchCount: number;
}>();

const chartMetricDefs = [
  { id: "revenue", label: "Faturamento", color: "#152318" },
  { id: "taxes", label: "Montante de Impostos", color: "#2563a6" },
] as const;
const selectedMetrics = ref<string[]>(["revenue", "taxes"]);
const chartData = { labels: [] as string[], datasets: [] };
const chartOptions = { responsive: true, maintainAspectRatio: false };

const toggleMetric = (metricId: string) => {
  selectedMetrics.value = selectedMetrics.value.includes(metricId)
    ? selectedMetrics.value.filter((id) => id !== metricId)
    : [...selectedMetrics.value, metricId];
};
</script>

<template>
  <section class="panel-card panel-card--chart">
    <div class="section-header">
      <div>
        <p class="section-header__eyebrow">Evolução</p>
        <h2>Selecione os dados que deseja comparar</h2>
      </div>

      <span class="pill">Dados consolidados</span>
    </div>

    <div v-if="props.pending" class="empty-state empty-state--loading">
      <i class="pi pi-spin pi-spinner" />
      <div>
        <strong>Carregando lançamentos...</strong>
        <p>Os dados do gráfico estarão disponíveis quando o serviço for reconstruído.</p>
      </div>
    </div>

    <div v-else-if="!props.launchCount" class="empty-state empty-state--void">
      <i class="pi pi-chart-bar" />
      <div>
        <strong>Nenhum dado para o gráfico ainda.</strong>
        <p>Os dados deste painel não estão conectados a uma fonte de dados.</p>
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
