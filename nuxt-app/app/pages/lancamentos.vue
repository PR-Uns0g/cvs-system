<script setup lang="ts">
import type { LaunchEntry } from "~/types/domain";

useHead({ title: "Lançamentos | CVS System" });

const entries = ref<LaunchEntry[]>([]);
const showRecordForm = ref(false);
const pending = ref(false);
const statusCounts = computed(() =>
  entries.value.reduce(
    (totals, entry) => {
      totals[entry.statusTone] += 1;
      return totals;
    },
    { success: 0, warn: 0, danger: 0, neutral: 0 },
  ),
);
const toggleRecordForm = () => {
  showRecordForm.value = !showRecordForm.value;
};
</script>

<template>
  <AppPageShell eyebrow="Operação" title="Lançamentos"
    subtitle="Envie notas fiscais por XML ou registre lançamentos manualmente.">
    <template #actions>
      <div class="launch-actions">
        <button
          type="button"
          :class="['page-shell__cta', { 'page-shell__cta--danger': showRecordForm }]"
          @click="toggleRecordForm"
        >
          <i :class="showRecordForm ? 'pi pi-times' : 'pi pi-plus'" />
          <span>{{ showRecordForm ? "Fechar formulário" : "Novo lançamento" }}</span>
        </button>
      </div>
    </template>

    <LaunchRecordForm :visible="showRecordForm" />

    <section class="panel-card filter-strip">
      <div class="filter-strip__item">
        <span>Período</span>
        <AppPeriodSelector disabled />
      </div>
    </section>

    <section v-if="!pending && !entries.length" class="panel-card launch-empty-hero">
      <AppEmptyState
        variant="void"
        stacked
        icon="pi pi-receipt"
        title="Os lançamentos não estão conectados a uma fonte de dados."
        description="Os envios são encaminhados à API, mas ainda não são persistidos."
      />
    </section>

    <section v-else class="panel-grid panel-grid--stats launch-stats">
      <AppStatCard label="Processados" :value="String(statusCounts.success)"
        detail="Notas já conferidas e prontas para consulta." icon="pi pi-check" tone="success" />
      <AppStatCard label="Pendentes" :value="String(statusCounts.warn)"
        detail="Registros aguardando complemento ou revisão." icon="pi pi-clock" tone="warn" />
      <AppStatCard label="Falhas" :value="String(statusCounts.danger)"
        detail="Arquivos que exigem correção antes de seguirem." icon="pi pi-exclamation-triangle" tone="danger" />
    </section>

    <LaunchEntriesList :entries="entries" :pending="pending" />
  </AppPageShell>
</template>

<style scoped>
.launch-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.launch-empty-hero {
  border: none;
  background: transparent;
  padding: 0;
}

.launch-stats {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 820px) {
  .launch-stats {
    grid-template-columns: 1fr;
  }
}
</style>
