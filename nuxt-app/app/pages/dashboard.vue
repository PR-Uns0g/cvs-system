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

    <DashboardChart :pending="isDashboardPending" :launch-count="launchCount" />

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
