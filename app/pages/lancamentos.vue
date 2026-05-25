<script setup lang="ts">
import type { Contractor, LaunchEntry, TaxDetail } from "~/types/api";

useHead({
  title: "Lançamentos | CVS System",
});

const launchesQuery = ref<Record<string, string>>({});

const {
  data: launchesPayload,
  pending,
  refresh,
} = await useApiFetch("/api/lancamentos", {
  key: "launches",
  query: launchesQuery,
});
const { data: contractorsPayload } = await useApiFetch("/api/contratantes", {
  key: "launch-contractors",
});

const contractorNameById = computed(() =>
  Object.fromEntries(
    contractors.value.map((c) => [String(c.id), c.legalName] as const),
  ),
);

const entries = computed<LaunchEntry[]>(() =>
  asArray(launchesPayload.value).map((item) =>
    normalizeLaunch(item, contractorNameById.value),
  ),
);
const contractors = computed<Contractor[]>(() =>
  asArray(contractorsPayload.value).map(normalizeContractor),
);

const showCreateForm = ref(false);
const showManualForm = ref(false);
const selectedFile = ref<File | null>(null);
const isUploading = ref(false);
const isSavingManual = ref(false);
const deletingId = ref<string | number | null>(null);
const feedback = ref<{ tone: "success" | "danger"; message: string } | null>(
  null,
);
const createForm = reactive({
  contractorRevenue: "",
});
const manualForm = reactive({
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

const search = ref("");
const currentPage = ref(1);
const pageSize = 10;
const expandedTaxesId = ref<string | number | null>(null);

const fileName = computed(
  () => selectedFile.value?.name || "Selecione o XML da nota",
);

const filteredEntries = computed(() => {
  const term = search.value.trim().toLowerCase();

  if (!term) {
    return entries.value;
  }

  return entries.value.filter((entry) =>
    [entry.date, entry.contractor, entry.status, entry.xmlLabel]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
});

const isSearchEmpty = computed(
  () => entries.value.length > 0 && filteredEntries.value.length === 0,
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredEntries.value.length / pageSize)),
);

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredEntries.value.slice(start, start + pageSize);
});

const statusCounts = computed(() =>
  entries.value.reduce(
    (totals, entry) => {
      totals[entry.statusTone] += 1;
      return totals;
    },
    { success: 0, warn: 0, danger: 0, neutral: 0 },
  ),
);

watch(search, () => {
  currentPage.value = 1;
});

watch(filteredEntries, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

watch(
  contractors,
  (items) => {
    if (!manualForm.contractorId && items.length) {
      manualForm.contractorId = String(items[0]!.id);
    }
  },
  { immediate: true },
);

const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value;
  if (showCreateForm.value) {
    showManualForm.value = false;
  }
  feedback.value = null;
};

const toggleManualForm = () => {
  showManualForm.value = !showManualForm.value;
  if (showManualForm.value) {
    showCreateForm.value = false;
  }
  feedback.value = null;
};

const handleCreateFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  selectedFile.value = input.files?.[0] || null;
};

const saveCreateEntry = async () => {
  if (!selectedFile.value) {
    feedback.value = {
      tone: "danger",
      message: "Selecione um arquivo XML antes de enviar.",
    };
    return;
  }

  const revenue = createForm.contractorRevenue.trim();
  if (!revenue) {
    feedback.value = {
      tone: "danger",
      message: "Informe o faturamento do contratante (campo exigido pela API).",
    };
    return;
  }

  feedback.value = null;
  isUploading.value = true;

  try {
    const formData = new FormData();
    formData.append("arquivo", selectedFile.value);
    formData.append("faturamento_contratante", revenue);

    await useRequestFetch()("/api/lancamentos/importar-xml", {
      method: "POST",
      body: formData,
    });

    selectedFile.value = null;
    createForm.contractorRevenue = "";
    showCreateForm.value = false;
    feedback.value = {
      tone: "success",
      message: "XML enviado para processamento.",
    };
    await refresh();
  } catch (error: unknown) {
    feedback.value = {
      tone: "danger",
      message: readApiErrorMessage(error, "Não foi possível importar o XML."),
    };
  } finally {
    isUploading.value = false;
  }
};

const resetManualForm = () => {
  manualForm.nfValue = "";
  manualForm.contractorRevenue = "";
  manualForm.emissionDate = "";
  for (const [, key] of taxFields) {
    manualForm[key] = "";
  }
};

const buildManualTaxes = () =>
  Object.fromEntries(
    taxFields
      .map(([apiName, key]) => [apiName, manualForm[key].trim()] as const)
      .filter(([, value]) => value !== ""),
  );

const saveManualEntry = async () => {
  if (!manualForm.contractorId) {
    feedback.value = {
      tone: "danger",
      message: "Selecione um contratante antes de salvar.",
    };
    return;
  }

  feedback.value = null;
  isSavingManual.value = true;

  try {
    await useRequestFetch()("/api/lancamentos/manual", {
      method: "POST",
      body: {
        contratante_id: Number(manualForm.contractorId),
        valor_nf: manualForm.nfValue,
        faturamento_contratante: manualForm.contractorRevenue,
        impostos: buildManualTaxes(),
        data_emissao: manualForm.emissionDate
          ? new Date(manualForm.emissionDate).toISOString()
          : null,
      },
    });
    resetManualForm();
    showManualForm.value = false;
    feedback.value = {
      tone: "success",
      message: "Lançamento manual cadastrado com sucesso.",
    };
    await refresh();
  } catch (error: unknown) {
    feedback.value = {
      tone: "danger",
      message: readApiErrorMessage(
        error,
        "Não foi possível cadastrar o lançamento manual.",
      ),
    };
  } finally {
    isSavingManual.value = false;
  }
};

const applyLaunchPeriod = (period: {
  period_start: string;
  period_end: string;
}) => {
  launchesQuery.value = {
    period_start: period.period_start,
    period_end: period.period_end,
  };
  currentPage.value = 1;
};

const toggleTaxes = (entryId: string | number) => {
  expandedTaxesId.value = expandedTaxesId.value === entryId ? null : entryId;
};

const deleteEntry = async (entry: LaunchEntry) => {
  feedback.value = null;
  deletingId.value = entry.id;

  try {
    await useRequestFetch()(`/api/lancamentos/${entry.id}`, {
      method: "DELETE",
    });
    if (expandedTaxesId.value === entry.id) {
      expandedTaxesId.value = null;
    }
    feedback.value = {
      tone: "success",
      message: "Lançamento removido com sucesso.",
    };
    await refresh();
  } catch (error: unknown) {
    feedback.value = {
      tone: "danger",
      message:
        error && typeof error === "object" && "statusMessage" in error
          ? String(error.statusMessage)
          : "Não foi possível remover o lançamento.",
    };
  } finally {
    deletingId.value = null;
  }
};

const previousPage = () => {
  currentPage.value = Math.max(1, currentPage.value - 1);
};

const nextPage = () => {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1);
};

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Alíquota total: soma dos impostos sobre o valor da NF (%). */
const formatAliquotaTotalSobreNf = (entry: LaunchEntry) => {
  if (entry.myRevenueNumber <= 0) {
    return "â€”";
  }
  return `${percentFormatter.format((entry.taxesTotalNumber / entry.myRevenueNumber) * 100)}%`;
};

/** Alíquota do tributo sobre o valor da NF (%). */
const formatAliquotaSobreNf = (tax: TaxDetail, nf: number) => {
  if (nf <= 0) {
    return "â€”";
  }
  return `${percentFormatter.format((tax.valueNumber / nf) * 100)}%`;
};
</script>

<template>
  <AppPageShell
    eyebrow="Operação"
    title="Lançamentos"
    subtitle="Importe XMLs e acompanhe os lançamentos retornados pela API autenticada."
  >
    <template #actions>
      <div class="launch-actions">
        <button
          type="button"
          :class="['secondary-action', { 'page-shell__cta--danger': showManualForm }]"
          @click="toggleManualForm"
        >
          <i class="pi pi-pencil" />
          <span>{{ showManualForm ? "Fechar manual" : "Lançamento manual" }}</span>
        </button>
        <button
          type="button"
          :class="[
            'page-shell__cta',
            { 'page-shell__cta--danger': showCreateForm },
          ]"
          @click="toggleCreateForm"
        >
          <i :class="showCreateForm ? 'pi pi-times' : 'pi pi-upload'" />
          <span>{{ showCreateForm ? "Fechar cadastro" : "Enviar XML" }}</span>
        </button>
      </div>
    </template>

    <p
      v-if="feedback"
      :class="[
        'form-feedback',
        feedback.tone === 'success'
          ? 'form-feedback--success'
          : 'form-feedback--danger',
      ]"
    >
      {{ feedback.message }}
    </p>

    <Transition name="expand-fade">
      <form
        v-if="showCreateForm"
        class="panel-card launch-form-card"
        @submit.prevent="saveCreateEntry"
      >
        <div class="section-header">
          <div>
            <p class="section-header__eyebrow">Novo lançamento</p>
            <h2>Importação da nota</h2>
          </div>
        </div>

        <p class="launch-form-hint">
          O contratante é identificado a partir do XML da nota. Informe o
          faturamento declarado (campo faturamento_contratante na API).
        </p>

        <div class="launch-form-layout">
          <label class="upload-dropzone upload-dropzone--input">
            <input
              type="file"
              accept=".xml"
              hidden
              @change="handleCreateFileChange"
            />
            <i class="pi pi-file-arrow-up" />
            <strong>{{ fileName }}</strong>
            <p>Clique para selecionar o XML da nota e enviar para a API.</p>
          </label>

          <div class="launch-form-side">
            <label class="mock-field">
              <span>Faturamento do contratante</span>
              <input
                v-model="createForm.contractorRevenue"
                class="mock-input"
                placeholder="Ex.: 148000.00"
                required
              />
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="page-shell__cta" :disabled="isUploading">
            <i class="pi pi-check" />
            <span>{{ isUploading ? "Enviando..." : "Salvar lançamento" }}</span>
          </button>
        </div>
      </form>
    </Transition>

    <Transition name="expand-fade">
      <form
        v-if="showManualForm"
        class="panel-card launch-form-card"
        @submit.prevent="saveManualEntry"
      >
        <div class="section-header">
          <div>
            <p class="section-header__eyebrow">Novo lançamento</p>
            <h2>Cadastro manual</h2>
          </div>
        </div>

        <div v-if="!contractors.length" class="empty-state empty-state--void">
          <i class="pi pi-users" />
          <div>
            <strong>Nenhum contratante disponível.</strong>
            <p>Cadastre um contratante antes de criar lançamentos manuais.</p>
          </div>
        </div>

        <template v-else>
          <div class="manual-form-grid">
            <label class="mock-field manual-form-grid__wide">
              <span>Contratante</span>
              <select v-model="manualForm.contractorId" class="mock-input" required>
                <option
                  v-for="contractor in contractors"
                  :key="contractor.id"
                  :value="contractor.id"
                >
                  {{ contractor.legalName }}
                </option>
              </select>
            </label>

            <label class="mock-field">
              <span>Valor da NF</span>
              <input v-model.trim="manualForm.nfValue" class="mock-input" inputmode="decimal" required />
            </label>

            <label class="mock-field">
              <span>Faturamento do contratante</span>
              <input
                v-model.trim="manualForm.contractorRevenue"
                class="mock-input"
                inputmode="decimal"
                required
              />
            </label>

            <label class="mock-field manual-form-grid__wide">
              <span>Data de emissão</span>
              <input v-model="manualForm.emissionDate" class="mock-input" type="datetime-local" />
            </label>
          </div>

          <div class="tax-section">
            <p class="section-header__eyebrow">Impostos</p>
            <div class="tax-section__grid">
              <label v-for="[label, key] in taxFields" :key="key" class="mock-field">
                <span>{{ label }}</span>
                <input v-model.trim="manualForm[key]" class="mock-input" inputmode="decimal" />
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="page-shell__cta" :disabled="isSavingManual">
              <i class="pi pi-check" />
              <span>{{ isSavingManual ? "Salvando..." : "Salvar lançamento manual" }}</span>
            </button>
          </div>
        </template>
      </form>
    </Transition>

    <section class="panel-card filter-strip">
      <div class="filter-strip__item">
        <span>Período</span>
        <AppPeriodSelector :disabled="pending" @change="applyLaunchPeriod" />
      </div>
    </section>

    <section
      v-if="!pending && !entries.length"
      class="panel-card launch-empty-hero"
    >
      <div class="empty-state empty-state--void empty-state--stacked">
        <i class="pi pi-receipt" />
        <div>
          <strong>Nenhum lançamento na sua conta ainda.</strong>
          <p>
            Os totais abaixo só passam a refletir notas reais depois da primeira
            importação. Use Enviar XML para registrar o primeiro lançamento.
          </p>
        </div>
      </div>
    </section>

    <section v-else class="panel-grid panel-grid--stats launch-stats">
      <AppStatCard
        label="Processados"
        :value="String(statusCounts.success)"
        detail="Notas já conferidas e prontas para consulta."
        icon="pi pi-check"
        tone="success"
      />
      <AppStatCard
        label="Pendentes"
        :value="String(statusCounts.warn)"
        detail="Registros aguardando complemento ou revisão."
        icon="pi pi-clock"
        tone="warn"
      />
      <AppStatCard
        label="Falhas"
        :value="String(statusCounts.danger)"
        detail="Arquivos que exigem correção antes de seguirem."
        icon="pi pi-exclamation-triangle"
        tone="danger"
      />
    </section>

    <section class="panel-card">
      <div class="section-toolbar">
        <div class="section-header">
          <div>
            <p class="section-header__eyebrow">Listagem</p>
            <h2>Todos os lançamentos</h2>
          </div>
        </div>

        <div class="table-search">
          <label class="mock-field">
            <span>Buscar lançamentos</span>
            <input
              v-model="search"
              class="mock-input"
              placeholder="Pesquise por contratante, status, data ou XML"
            />
          </label>
          <span class="pill">{{
            pending ? "Carregando" : `${filteredEntries.length} registros`
          }}</span>
        </div>
      </div>

      <div v-if="pending" class="empty-state empty-state--loading">
        <i class="pi pi-spin pi-spinner" />
        <div>
          <strong>Carregando lançamentos...</strong>
        </div>
      </div>

      <div
        v-else-if="!filteredEntries.length"
        :class="['empty-state', isSearchEmpty ? 'empty-state--search' : 'empty-state--void']"
      >
        <i class="pi pi-receipt" />
        <div>
          <strong>{{
            isSearchEmpty
              ? "Nenhum resultado para a busca."
              : "Nenhum lançamento encontrado."
          }}</strong>
          <p>
            {{
              isSearchEmpty
                ? "Limpe o filtro ou tente outro termo."
                : "Envie um XML para criar o primeiro lançamento."
            }}
          </p>
        </div>
      </div>

      <div v-else class="table-wrap">
        <table class="app-data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Contratante</th>
              <th>Meu Faturamento</th>
              <th>Total Impostos</th>
              <th>Status</th>
              <th>Impostos</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="entry in paginatedEntries" :key="entry.id">
              <tr>
                <td>{{ entry.date }}</td>
                <td>{{ entry.contractor }}</td>
                <td>{{ entry.myRevenue }}</td>
                <td>{{ entry.taxesTotal }}</td>
                <td>
                  <span
                    :class="['status-pill', `status-pill--${entry.statusTone}`]"
                  >
                    {{ entry.status }}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    class="table-action table-action--ghost"
                    :disabled="!entry.taxes.length"
                    @click="toggleTaxes(entry.id)"
                  >
                    <i
                      :class="
                        expandedTaxesId === entry.id
                          ? 'pi pi-eye-slash'
                          : 'pi pi-eye'
                      "
                    />
                    <span>Ver</span>
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    class="table-action table-action--danger"
                    :disabled="deletingId === entry.id"
                    @click="deleteEntry(entry)"
                  >
                    <i class="pi pi-trash" />
                    <span>{{ deletingId === entry.id ? "Removendo" : "Remover" }}</span>
                  </button>
                </td>
              </tr>

              <tr v-if="expandedTaxesId === entry.id">
                <td colspan="7" class="details-row">
                  <div class="inline-panel">
                    <div>
                      <p class="section-header__eyebrow">Impostos</p>
                      <h3>Composição do total de impostos</h3>
                      <p class="tax-panel-summary">
                        <span class="tax-panel-summary__label"
                          >Alíquota total (sobre NF)</span
                        >
                        <span class="tax-panel-summary__value">{{
                          formatAliquotaTotalSobreNf(entry)
                        }}</span>
                        <span class="tax-panel-summary__hint"
                          >Percentual do total de impostos em relação ao valor da sua
                          nota.</span
                        >
                      </p>
                    </div>

                    <div class="tax-grid">
                      <article
                        v-for="tax in entry.taxes"
                        :key="tax.name"
                        class="tax-card"
                      >
                        <p class="tax-card__name">{{ tax.name }}</p>
                        <strong class="tax-card__value">{{ tax.value }}</strong>
                        <small
                          v-if="tax.rate !== '-'"
                          class="tax-card__declared"
                          >Declarada: {{ tax.rate }}</small
                        >
                        <small class="tax-card__aliquota"
                          >Alíquota:
                          {{
                            formatAliquotaSobreNf(tax, entry.myRevenueNumber)
                          }}</small
                        >
                      </article>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="!pending && totalPages > 1" class="table-pagination">
        <button
          type="button"
          class="table-action table-action--ghost"
          :disabled="currentPage === 1"
          @click="previousPage"
        >
          <i class="pi pi-angle-left" />
          <span>Anterior</span>
        </button>
        <strong>Página {{ currentPage }} de {{ totalPages }}</strong>
        <button
          type="button"
          class="table-action table-action--ghost"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          <span>Próxima</span>
          <i class="pi pi-angle-right" />
        </button>
      </div>
    </section>
  </AppPageShell>
</template>

<style scoped>
.launch-form-card,
.section-toolbar {
  display: grid;
  gap: 1.25rem;
}

.launch-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.launch-form-hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.95rem;
  line-height: 1.55;
}

.launch-form-layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.9fr);
}

.launch-form-side {
  display: grid;
  align-content: start;
  gap: 1rem;
}

.manual-form-grid,
.tax-section__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.manual-form-grid__wide {
  grid-column: 1 / -1;
}

.tax-section {
  display: grid;
  gap: 0.75rem;
}

.upload-dropzone--input {
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.launch-empty-hero {
  border: none;
  background: transparent;
  padding: 0;
}

.launch-stats {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.table-search {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.table-search .mock-field {
  flex: 1;
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

.table-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.table-action--ghost {
  border-color: rgba(20, 32, 19, 0.1);
  background: #fff;
  color: var(--color-text);
}

.table-action--danger {
  border-color: rgba(187, 52, 52, 0.14);
  background: rgba(187, 52, 52, 0.08);
  color: #ab3030;
}

.details-row td {
  padding: 0;
  border-bottom: 0;
}

.inline-panel {
  display: grid;
  gap: 1rem;
  background: rgba(244, 248, 243, 0.96);
  padding: 1.2rem;
}

.inline-panel h3 {
  margin: 0.35rem 0 0;
  font-size: 1.1rem;
}

.tax-panel-summary {
  display: grid;
  gap: 0.2rem;
  margin: 0.75rem 0 0;
  padding: 0.75rem 0.95rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(20, 32, 19, 0.08);
  background: #fff;
}

.tax-panel-summary__label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.tax-panel-summary__value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
}

.tax-panel-summary__hint {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--color-muted);
}

.tax-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.tax-card {
  display: grid;
  gap: 0.35rem;
  border: 1px solid rgba(20, 32, 19, 0.06);
  border-radius: 1.2rem;
  background: #fff;
  padding: 1rem;
}

.tax-card__name,
.tax-card__value,
.tax-card__declared,
.tax-card__aliquota {
  margin: 0;
}

.tax-card__name,
.tax-card__declared,
.tax-card__aliquota {
  color: var(--color-muted);
}

.tax-card__name {
  font-weight: 600;
  color: var(--color-text);
}

.tax-card__value {
  font-size: 1.05rem;
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
}

.expand-fade-enter-active,
.expand-fade-leave-active {
  overflow: hidden;
  transition:
    max-height 0.28s ease,
    opacity 0.22s ease,
    transform 0.22s ease;
}

.expand-fade-enter-from,
.expand-fade-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}

.expand-fade-enter-to,
.expand-fade-leave-from {
  max-height: 60rem;
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1100px) {
  .launch-form-layout,
  .manual-form-grid,
  .tax-section__grid,
  .tax-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .launch-stats,
  .table-search,
  .table-pagination {
    grid-template-columns: 1fr;
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
