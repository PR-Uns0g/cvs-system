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

    <AppEmptyState
      v-if="props.pending"
      variant="loading"
      icon="pi pi-spin pi-spinner"
      title="Carregando lançamentos..."
      description="Os dados do gráfico estarão disponíveis quando o serviço for reconstruído."
    />

    <AppEmptyState
      v-else-if="!props.launchCount"
      variant="void"
      icon="pi pi-chart-bar"
      title="Nenhum dado para o gráfico ainda."
      description="Os dados deste painel não estão conectados a uma fonte de dados."
      :link="{ to: '/lancamentos', label: 'Ir para lançamentos' }"
    />

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

</style>
