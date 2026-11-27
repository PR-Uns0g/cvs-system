<script setup lang="ts">
import type { Contractor } from "~/types/domain";

useHead({ title: "Contratantes | CVS System" });

const contractors = ref<Contractor[]>([]);
const pending = ref(false);
const showCreateForm = ref(false);
const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value;
};
</script>

<template>
  <AppPageShell
    eyebrow="Cadastro"
    title="Contratantes"
    subtitle="Prévia visual do cadastro e consulta de contratantes."
  >
    <template #actions>
      <button
        type="button"
        :class="['page-shell__cta', { 'page-shell__cta--danger': showCreateForm }]"
        @click="toggleCreateForm"
      >
        <i :class="showCreateForm ? 'pi pi-times' : 'pi pi-plus'" />
        <span>{{ showCreateForm ? "Fechar formulário" : "Novo contratante" }}</span>
      </button>
    </template>

    <ContractorCreateForm :visible="showCreateForm" />

    <section class="panel-card filter-strip">
      <div class="filter-strip__item">
        <span>Período</span>
        <AppPeriodSelector
          disabled
          :emit-on-mount="false"
        />
        <p class="period-hint">
          Os filtros de período ficarão disponíveis quando o serviço de dados for reconstruído.
        </p>
      </div>
    </section>

    <ContractorList :contractors="contractors" :pending="pending" />
  </AppPageShell>
</template>

<style scoped>
.period-hint {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
  font-size: 0.82rem;
  line-height: 1.45;
  max-width: 42rem;
}
</style>
