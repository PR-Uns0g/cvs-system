<script setup lang="ts">
import type { Contractor } from "~/types/domain";

useHead({
  title: "Lançamento manual | CVS System",
});

const contractors = ref<Contractor[]>([]);
const form = reactive({
  contractorId: "",
  nfValue: "",
  contractorRevenue: "",
  emissionDate: "",
  pis: "",
  cofins: "",
  inss: "",
  ir: "",
  csll: "",
  iss: "",
  other: "",
});

const taxFields = [
  ["PIS", "pis"],
  ["COFINS", "cofins"],
  ["INSS", "inss"],
  ["IR", "ir"],
  ["CSLL", "csll"],
  ["ISS", "iss"],
  ["Other", "other"],
] as const;

</script>

<template>
  <AppPageShell
    eyebrow="Operação"
    title="Lançamento manual"
    subtitle="Prévia visual do formulário de lançamento manual."
  >
    <template #actions>
      <NuxtLink to="/lancamentos" class="secondary-action">
        <i class="pi pi-arrow-left" />
        <span>Voltar</span>
      </NuxtLink>
    </template>

    <section class="panel-card empty-state empty-state--panel">
      <i class="pi pi-users" />
      <div>
        <strong>Prévia visual do cadastro manual.</strong>
        <p>O formulário não está conectado a dados e não salva alterações.</p>
      </div>
    </section>

    <form class="panel-card manual-form" @submit.prevent>
      <div class="manual-form__grid">
        <label class="mock-field manual-form__wide">
          <span>Contratante</span>
          <select v-model="form.contractorId" class="mock-input" :disabled="!contractors.length">
            <option value="" disabled>Selecione um contratante</option>
            <option v-for="contractor in contractors" :key="contractor.id" :value="contractor.id">
              {{ contractor.legalName }}
            </option>
          </select>
        </label>

        <label class="mock-field">
          <span>Valor da NF</span>
          <input v-model.trim="form.nfValue" class="mock-input" inputmode="decimal" />
        </label>

        <label class="mock-field">
          <span>Faturamento do contratante</span>
          <input
            v-model.trim="form.contractorRevenue"
            class="mock-input"
            inputmode="decimal"
          />
        </label>

        <label class="mock-field manual-form__wide">
          <span>Data de emissão</span>
          <input v-model="form.emissionDate" class="mock-input" type="datetime-local" />
        </label>
      </div>

      <div class="tax-section">
        <div class="section-header">
          <div>
            <p class="section-header__eyebrow">Impostos</p>
            <h2>Valores retidos</h2>
          </div>
        </div>

        <div class="tax-section__grid">
          <label v-for="[label, key] in taxFields" :key="key" class="mock-field">
            <span>{{ label }}</span>
            <input v-model.trim="form[key]" class="mock-input" inputmode="decimal" />
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="page-shell__cta" disabled>
          <i class="pi pi-check" />
          <span>Salvar lançamento</span>
        </button>
      </div>
    </form>
  </AppPageShell>
</template>

<style scoped>
.manual-form {
  display: grid;
  gap: 1.4rem;
}

.manual-form__grid,
.tax-section__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.manual-form__wide {
  grid-column: 1 / -1;
}

.tax-section {
  display: grid;
  gap: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.manual-link {
  display: inline-block;
  margin-top: 0.65rem;
  font-weight: 700;
  color: var(--color-brand-strong);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.empty-state--panel {
  border: 1px dashed rgba(20, 32, 19, 0.12);
  background: rgba(247, 250, 247, 0.65);
}

@media (max-width: 820px) {
  .manual-form__grid,
  .tax-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
