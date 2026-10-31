<script setup lang="ts">
type SelectableOption = {
  id: string;
  label: string;
  helper: string;
};

useHead({ title: "Relatórios | CVS System" });

const contractorOptions = ref<SelectableOption[]>([]);
const fieldOptions: SelectableOption[] = [
  { id: "contratantes_revenue", label: "Receita do contratante", helper: "Valor informado no lançamento." },
  { id: "users_revenue", label: "Valor da NF", helper: "Valor dos serviços na nota." },
  { id: "impostos_amount", label: "Impostos", helper: "Total e detalhe dos tributos." },
];
const selectedContractors = ref<string[]>([]);
const selectedFields = ref(["contratantes_revenue", "users_revenue"]);
const hasContractors = computed(() => contractorOptions.value.length > 0);
const toggleAllContractors = () => {
  selectedContractors.value =
    selectedContractors.value.length === contractorOptions.value.length
      ? []
      : contractorOptions.value.map((option) => option.id);
};
const toggleAllFields = () => {
  selectedFields.value =
    selectedFields.value.length === fieldOptions.length
      ? []
      : fieldOptions.map((option) => option.id);
};
const toggleContractor = (optionId: string) => {
  selectedContractors.value = selectedContractors.value.includes(optionId)
    ? selectedContractors.value.filter((id) => id !== optionId)
    : [...selectedContractors.value, optionId];
};
const toggleField = (optionId: string) => {
  selectedFields.value = selectedFields.value.includes(optionId)
    ? selectedFields.value.filter((id) => id !== optionId)
    : [...selectedFields.value, optionId];
};
</script>

<template>
  <AppPageShell
    eyebrow="Configuração"
    title="Relatórios"
    subtitle="Prévia visual das opções de configuração de relatórios."
  >
    <section class="panel-card report-notice">
      <i class="pi pi-info-circle" />
      <div>
        <strong>Relatórios estão temporariamente indisponíveis.</strong>
        <p>
          Esta tela será conectada novamente quando o serviço de dados for reconstruído.
        </p>
      </div>
    </section>

    <section class="panel-card report-builder">
      <div class="section-header">
        <div>
          <p class="section-header__eyebrow">Geração</p>
          <h2>Configure os dados do relatório</h2>
        </div>
      </div>

      <div class="report-builder__grid">
        <article class="report-builder__block">
          <h3>Período a analisar</h3>
          <AppPeriodSelector disabled />
        </article>

        <article class="report-builder__block">
          <div class="report-builder__block-header">
            <div>
              <h3>Contratantes</h3>
              <p>Selecione um, vários ou todos de uma vez.</p>
            </div>
            <button
              v-if="hasContractors"
              type="button"
              class="table-action table-action--ghost"
              @click="toggleAllContractors"
            >
              <span>Selecionar todos</span>
            </button>
          </div>

          <div v-if="!hasContractors" class="empty-state empty-state--report">
            <i class="pi pi-file-export" />
            <div>
              <strong>Nenhum contratante para incluir no relatório.</strong>
              <p>
                As opções de contratantes e exportação estarão disponíveis quando o serviço
                for reconstruído.
              </p>
              <NuxtLink to="/contratantes" class="empty-state__link"
                >Ir para contratantes</NuxtLink
              >
            </div>
          </div>

          <div v-else class="choice-grid">
            <label
              v-for="option in contractorOptions"
              :key="option.id"
              :class="[
                'choice-card',
                { 'is-selected': selectedContractors.includes(option.id) },
              ]"
            >
              <input
                :checked="selectedContractors.includes(option.id)"
                type="checkbox"
                @change="toggleContractor(option.id)"
              />
              <div>
                <strong>{{ option.label }}</strong>
                <small>{{ option.helper }}</small>
              </div>
            </label>
          </div>
        </article>

        <article class="report-builder__block">
          <div class="report-builder__block-header">
            <div>
              <h3>Campos para incluir</h3>
              <p>Selecione ao menos um campo para compor o relatório.</p>
            </div>
            <button
              type="button"
              class="table-action table-action--ghost"
              @click="toggleAllFields"
            >
              <span>Selecionar todos</span>
            </button>
          </div>

          <div class="choice-grid choice-grid--compact">
            <label
              v-for="option in fieldOptions"
              :key="option.id"
              :class="[
                'choice-card',
                { 'is-selected': selectedFields.includes(option.id) },
              ]"
            >
              <input
                :checked="selectedFields.includes(option.id)"
                type="checkbox"
                @change="toggleField(option.id)"
              />
              <div>
                <strong>{{ option.label }}</strong>
                <small>{{ option.helper }}</small>
              </div>
            </label>
          </div>
        </article>
      </div>

      <div class="report-builder__footer">
        <p v-if="hasContractors">
          A geração será habilitada quando o serviço estiver disponível.
        </p>
        <p v-else>
          A exportação estará disponível quando o serviço for reconstruído.
        </p>
        <button
          type="button"
          class="page-shell__cta"
          disabled
        >
          <i class="pi pi-download" />
          <span>Gerar relatório</span>
        </button>
      </div>
    </section>
  </AppPageShell>
</template>

<style scoped>
.report-notice {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.report-notice i {
  color: var(--color-brand);
  font-size: 1.5rem;
}

.report-notice strong,
.report-notice p {
  margin: 0;
}

.report-notice p {
  margin-top: 0.4rem;
  color: var(--color-muted);
  line-height: 1.55;
}

.report-builder {
  display: grid;
  gap: 1.4rem;
}

.report-builder__grid {
  display: grid;
  gap: 1.25rem;
}

.report-builder__block {
  display: grid;
  gap: 1rem;
  border: 1px solid rgba(20, 32, 19, 0.06);
  border-radius: 1.5rem;
  background: rgba(247, 250, 247, 0.9);
  padding: 1.15rem;
}

.report-builder__block h3,
.report-builder__block p,
.report-builder__block-header p {
  margin: 0;
}

.report-builder__block-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.report-builder__block-header p,
.report-builder__block p {
  color: var(--color-muted);
  line-height: 1.5;
}

.report-period-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.choice-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.choice-grid--compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.choice-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  border: 1px solid rgba(20, 32, 19, 0.08);
  border-radius: 1.25rem;
  background: #fff;
  cursor: pointer;
  padding: 1rem;
}

.choice-card input {
  margin-top: 0.2rem;
}

.choice-card div {
  display: grid;
  gap: 0.25rem;
}

.choice-card strong,
.choice-card small {
  margin: 0;
}

.choice-card small {
  color: var(--color-muted);
  line-height: 1.45;
}

.choice-card.is-selected {
  border-color: rgba(47, 122, 79, 0.22);
  background: rgba(47, 122, 79, 0.05);
}

.report-builder__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid rgba(20, 32, 19, 0.08);
  padding-top: 1.2rem;
}

.report-builder__footer p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.5;
}

.table-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.58rem 0.8rem;
  font-weight: 700;
}

.table-action--ghost {
  border-color: rgba(20, 32, 19, 0.1);
  background: #fff;
  color: var(--color-text);
}

.report-empty-link {
  display: inline-block;
  margin-top: 0.65rem;
  font-weight: 700;
  color: var(--color-brand-strong);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

@media (max-width: 1024px) {
  .choice-grid,
  .choice-grid--compact,
  .report-period-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .report-builder__block-header,
  .report-builder__footer {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
