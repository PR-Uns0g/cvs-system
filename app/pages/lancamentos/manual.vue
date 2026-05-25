<script setup lang="ts">
import type { Contractor } from "~/types/api";

useHead({
  title: "LanÃ§amento manual | CVS System",
});

const { data: contractorsPayload } = await useApiFetch("/api/contratantes", {
  key: "manual-launch-contractors",
});

const contractors = computed<Contractor[]>(() =>
  asArray(contractorsPayload.value).map(normalizeContractor),
);

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

const isSaving = ref(false);
const feedback = ref<{ tone: "success" | "danger"; message: string } | null>(null);

watch(
  contractors,
  (items) => {
    if (!form.contractorId && items.length) {
      form.contractorId = String(items[0]!.id);
    }
  },
  { immediate: true },
);

const taxFields = [
  ["PIS", "pis"],
  ["COFINS", "cofins"],
  ["INSS", "inss"],
  ["IR", "ir"],
  ["CSLL", "csll"],
  ["ISS", "iss"],
  ["Other", "other"],
] as const;

const resetForm = () => {
  form.nfValue = "";
  form.contractorRevenue = "";
  form.emissionDate = "";
  for (const [, key] of taxFields) {
    form[key] = "";
  }
};

const buildTaxes = () =>
  Object.fromEntries(
    taxFields
      .map(([apiName, key]) => [apiName, form[key].trim()] as const)
      .filter(([, value]) => value !== ""),
  );

const saveManualLaunch = async () => {
  feedback.value = null;
  isSaving.value = true;

  try {
    await useRequestFetch()("/api/lancamentos/manual", {
      method: "POST",
      body: {
        contratante_id: Number(form.contractorId),
        valor_nf: form.nfValue,
        faturamento_contratante: form.contractorRevenue,
        impostos: buildTaxes(),
        data_emissao: form.emissionDate ? new Date(form.emissionDate).toISOString() : null,
      },
    });

    resetForm();
    feedback.value = {
      tone: "success",
      message: "LanÃ§amento manual cadastrado com sucesso.",
    };
  } catch (error: unknown) {
    feedback.value = {
      tone: "danger",
      message:
        error && typeof error === "object" && "statusMessage" in error
          ? String(error.statusMessage)
          : "NÃ£o foi possÃ­vel cadastrar o lanÃ§amento manual.",
    };
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <AppPageShell
    eyebrow="OperaÃ§Ã£o"
    title="LanÃ§amento manual"
    subtitle="Cadastre um lanÃ§amento em JSON pela rota manual da API."
  >
    <template #actions>
      <NuxtLink to="/lancamentos" class="secondary-action">
        <i class="pi pi-arrow-left" />
        <span>Voltar</span>
      </NuxtLink>
    </template>

    <p
      v-if="feedback"
      :class="[
        'form-feedback',
        feedback.tone === 'success' ? 'form-feedback--success' : 'form-feedback--danger',
      ]"
    >
      {{ feedback.message }}
    </p>

    <section v-if="!contractors.length" class="panel-card empty-state empty-state--panel">
      <i class="pi pi-users" />
      <div>
        <strong>Nenhum contratante disponÃ­vel.</strong>
        <p>Cadastre um contratante antes de criar lanÃ§amentos manuais.</p>
        <NuxtLink to="/contratantes" class="manual-link">Ir para contratantes</NuxtLink>
      </div>
    </section>

    <form v-else class="panel-card manual-form" @submit.prevent="saveManualLaunch">
      <div class="manual-form__grid">
        <label class="mock-field manual-form__wide">
          <span>Contratante</span>
          <select v-model="form.contractorId" class="mock-input" required>
            <option v-for="contractor in contractors" :key="contractor.id" :value="contractor.id">
              {{ contractor.legalName }}
            </option>
          </select>
        </label>

        <label class="mock-field">
          <span>Valor da NF</span>
          <input v-model.trim="form.nfValue" class="mock-input" inputmode="decimal" required />
        </label>

        <label class="mock-field">
          <span>Faturamento do contratante</span>
          <input
            v-model.trim="form.contractorRevenue"
            class="mock-input"
            inputmode="decimal"
            required
          />
        </label>

        <label class="mock-field manual-form__wide">
          <span>Data de emissÃ£o</span>
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
        <button type="submit" class="page-shell__cta" :disabled="isSaving">
          <i class="pi pi-check" />
          <span>{{ isSaving ? "Salvando..." : "Salvar lanÃ§amento" }}</span>
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
