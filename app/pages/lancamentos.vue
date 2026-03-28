<script setup lang="ts">
type TaxDetail = {
  name: string;
  rate: string;
  value: string;
};

type LaunchEntry = {
  id: number;
  date: string;
  contractor: string;
  contractorRevenue: string;
  taxesTotal: string;
  myRevenue: string;
  status: string;
  statusTone: "success" | "warn" | "danger" | "neutral";
  xmlLabel: string;
  taxes: TaxDetail[];
};

useHead({
  title: "Lançamentos | CVS System",
});

const contractorOptions = [
  "Nova Era Distribuidora",
  "Comercial Horizonte",
  "Atacado São Jorge",
  "Central Alimentos",
  "Mercantil do Vale",
];

const entries = ref<LaunchEntry[]>([
  {
    id: 1,
    date: "28 mar 2026",
    contractor: "Nova Era Distribuidora",
    contractorRevenue: "R$ 148.000",
    taxesTotal: "R$ 18.640",
    myRevenue: "R$ 7.400",
    status: "Processado",
    statusTone: "success",
    xmlLabel: "NFE-28490.xml",
    taxes: [
      { name: "ICMS", rate: "12%", value: "R$ 17.760" },
      { name: "PIS", rate: "0,5%", value: "R$ 740" },
      { name: "COFINS", rate: "0,1%", value: "R$ 140" },
    ],
  },
  {
    id: 2,
    date: "27 mar 2026",
    contractor: "Comercial Horizonte",
    contractorRevenue: "R$ 82.000",
    taxesTotal: "R$ 10.004",
    myRevenue: "R$ 4.100",
    status: "Pendente",
    statusTone: "warn",
    xmlLabel: "NFE-77102.xml",
    taxes: [
      { name: "ICMS", rate: "11%", value: "R$ 9.020" },
      { name: "PIS", rate: "0,8%", value: "R$ 656" },
      { name: "COFINS", rate: "0,4%", value: "R$ 328" },
    ],
  },
  {
    id: 3,
    date: "26 mar 2026",
    contractor: "Atacado São Jorge",
    contractorRevenue: "R$ 124.500",
    taxesTotal: "R$ 15.455",
    myRevenue: "R$ 6.225",
    status: "Processado",
    statusTone: "success",
    xmlLabel: "NFE-66234.xml",
    taxes: [
      { name: "ICMS", rate: "11,5%", value: "R$ 14.317" },
      { name: "PIS", rate: "0,7%", value: "R$ 872" },
      { name: "COFINS", rate: "0,2%", value: "R$ 266" },
    ],
  },
  {
    id: 4,
    date: "25 mar 2026",
    contractor: "Central Alimentos",
    contractorRevenue: "R$ 96.800",
    taxesTotal: "R$ 11.712",
    myRevenue: "R$ 4.840",
    status: "Falha",
    statusTone: "danger",
    xmlLabel: "NFE-77412.xml",
    taxes: [
      { name: "ICMS", rate: "10,8%", value: "R$ 10.454" },
      { name: "PIS", rate: "0,9%", value: "R$ 871" },
      { name: "COFINS", rate: "0,4%", value: "R$ 387" },
    ],
  },
  {
    id: 5,
    date: "24 mar 2026",
    contractor: "Mercantil do Vale",
    contractorRevenue: "R$ 110.000",
    taxesTotal: "R$ 13.200",
    myRevenue: "R$ 5.500",
    status: "Processado",
    statusTone: "success",
    xmlLabel: "NFE-44921.xml",
    taxes: [
      { name: "ICMS", rate: "11%", value: "R$ 12.100" },
      { name: "PIS", rate: "0,7%", value: "R$ 770" },
      { name: "COFINS", rate: "0,3%", value: "R$ 330" },
    ],
  },
  {
    id: 6,
    date: "23 mar 2026",
    contractor: "Nova Era Distribuidora",
    contractorRevenue: "R$ 132.600",
    taxesTotal: "R$ 16.177",
    myRevenue: "R$ 6.630",
    status: "Pendente",
    statusTone: "warn",
    xmlLabel: "NFE-55218.xml",
    taxes: [
      { name: "ICMS", rate: "11,4%", value: "R$ 15.116" },
      { name: "PIS", rate: "0,6%", value: "R$ 796" },
      { name: "COFINS", rate: "0,2%", value: "R$ 265" },
    ],
  },
  {
    id: 7,
    date: "22 mar 2026",
    contractor: "Comercial Horizonte",
    contractorRevenue: "R$ 74.900",
    taxesTotal: "R$ 8.988",
    myRevenue: "R$ 3.745",
    status: "Processado",
    statusTone: "success",
    xmlLabel: "NFE-22280.xml",
    taxes: [
      { name: "ICMS", rate: "10,9%", value: "R$ 8.164" },
      { name: "PIS", rate: "0,7%", value: "R$ 524" },
      { name: "COFINS", rate: "0,4%", value: "R$ 300" },
    ],
  },
  {
    id: 8,
    date: "21 mar 2026",
    contractor: "Atacado São Jorge",
    contractorRevenue: "R$ 141.000",
    taxesTotal: "R$ 17.907",
    myRevenue: "R$ 7.050",
    status: "Falha",
    statusTone: "danger",
    xmlLabel: "NFE-98120.xml",
    taxes: [
      { name: "ICMS", rate: "12%", value: "R$ 16.920" },
      { name: "PIS", rate: "0,5%", value: "R$ 705" },
      { name: "COFINS", rate: "0,2%", value: "R$ 282" },
    ],
  },
  {
    id: 9,
    date: "20 mar 2026",
    contractor: "Central Alimentos",
    contractorRevenue: "R$ 89.300",
    taxesTotal: "R$ 10.806",
    myRevenue: "R$ 4.465",
    status: "Processado",
    statusTone: "success",
    xmlLabel: "NFE-11002.xml",
    taxes: [
      { name: "ICMS", rate: "11%", value: "R$ 9.823" },
      { name: "PIS", rate: "0,7%", value: "R$ 625" },
      { name: "COFINS", rate: "0,4%", value: "R$ 358" },
    ],
  },
  {
    id: 10,
    date: "19 mar 2026",
    contractor: "Mercantil do Vale",
    contractorRevenue: "R$ 101.400",
    taxesTotal: "R$ 12.067",
    myRevenue: "R$ 5.070",
    status: "Pendente",
    statusTone: "warn",
    xmlLabel: "NFE-44531.xml",
    taxes: [
      { name: "ICMS", rate: "10,8%", value: "R$ 10.951" },
      { name: "PIS", rate: "0,7%", value: "R$ 710" },
      { name: "COFINS", rate: "0,4%", value: "R$ 406" },
    ],
  },
  {
    id: 11,
    date: "18 mar 2026",
    contractor: "Nova Era Distribuidora",
    contractorRevenue: "R$ 158.400",
    taxesTotal: "R$ 19.215",
    myRevenue: "R$ 7.920",
    status: "Processado",
    statusTone: "success",
    xmlLabel: "NFE-33918.xml",
    taxes: [
      { name: "ICMS", rate: "11,6%", value: "R$ 18.374" },
      { name: "PIS", rate: "0,4%", value: "R$ 634" },
      { name: "COFINS", rate: "0,1%", value: "R$ 207" },
    ],
  },
  {
    id: 12,
    date: "17 mar 2026",
    contractor: "Comercial Horizonte",
    contractorRevenue: "R$ 93.500",
    taxesTotal: "R$ 11.407",
    myRevenue: "R$ 4.675",
    status: "Processado",
    statusTone: "success",
    xmlLabel: "NFE-51001.xml",
    taxes: [
      { name: "ICMS", rate: "11%", value: "R$ 10.285" },
      { name: "PIS", rate: "0,8%", value: "R$ 748" },
      { name: "COFINS", rate: "0,4%", value: "R$ 374" },
    ],
  },
]);

const showCreateForm = ref(false);
const manualContractorSelection = ref(false);
const createFileName = ref("Selecione o XML da nota");
const createForm = reactive({
  selectedContractor: contractorOptions[0] || "",
  contractorRevenue: "",
});

const search = ref("");
const currentPage = ref(1);
const pageSize = 10;
const expandedTaxesId = ref<number | null>(null);
const editingEntryId = ref<number | null>(null);
const deletingEntryId = ref<number | null>(null);
const editFileName = ref("Nenhum XML selecionado");
const editForm = reactive({
  contractor: contractorOptions[0] || "",
  contractorRevenue: "",
  myRevenue: "",
});

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

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredEntries.value.length / pageSize)),
);

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredEntries.value.slice(start, start + pageSize);
});

const activeEditingEntry = computed(
  () =>
    entries.value.find((entry) => entry.id === editingEntryId.value) ?? null,
);

watch(search, () => {
  currentPage.value = 1;
});

watch(filteredEntries, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

const closeInlinePanels = () => {
  expandedTaxesId.value = null;
  editingEntryId.value = null;
  deletingEntryId.value = null;
};

const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value;
};

const handleCreateFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  createFileName.value = input.files?.[0]?.name || "Selecione o XML da nota";
};

const saveCreateEntry = () => {
  entries.value.unshift({
    id: Date.now(),
    date: "Hoje",
    contractor: manualContractorSelection.value
      ? createForm.selectedContractor
      : "Reconhecimento automático",
    contractorRevenue: createForm.contractorRevenue || "R$ 0",
    taxesTotal: "R$ 0",
    myRevenue: "R$ 0",
    status: "Pendente",
    statusTone: "warn",
    xmlLabel: createFileName.value,
    taxes: [],
  });

  createForm.contractorRevenue = "";
  createFileName.value = "Selecione o XML da nota";
  manualContractorSelection.value = false;
  showCreateForm.value = false;
  currentPage.value = 1;
};

const toggleTaxes = (entryId: number) => {
  expandedTaxesId.value = expandedTaxesId.value === entryId ? null : entryId;
  editingEntryId.value = null;
  deletingEntryId.value = null;
};

const startEdit = (entry: LaunchEntry) => {
  editingEntryId.value = entry.id;
  expandedTaxesId.value = null;
  deletingEntryId.value = null;
  editForm.contractor = entry.contractor;
  editForm.contractorRevenue = entry.contractorRevenue;
  editForm.myRevenue = entry.myRevenue;
  editFileName.value = entry.xmlLabel;
};

const cancelEdit = () => {
  editingEntryId.value = null;
};

const handleEditFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  editFileName.value = input.files?.[0]?.name || editFileName.value;
};

const saveEdit = () => {
  if (!activeEditingEntry.value) {
    return;
  }

  activeEditingEntry.value.contractor = editForm.contractor;
  activeEditingEntry.value.contractorRevenue = editForm.contractorRevenue;
  activeEditingEntry.value.myRevenue = editForm.myRevenue;
  activeEditingEntry.value.xmlLabel = editFileName.value;
  editingEntryId.value = null;
};

const askDeleteEntry = (entryId: number) => {
  deletingEntryId.value = deletingEntryId.value === entryId ? null : entryId;
  expandedTaxesId.value = null;
  editingEntryId.value = null;
};

const confirmDeleteEntry = (entryId: number) => {
  entries.value = entries.value.filter((entry) => entry.id !== entryId);
  deletingEntryId.value = null;

  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
};

const previousPage = () => {
  currentPage.value = Math.max(1, currentPage.value - 1);
};

const nextPage = () => {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1);
};
</script>

<template>
  <AppPageShell
    eyebrow="Operação"
    title="Lançamentos"
    subtitle="Cadastre notas com clareza, acompanhe o processamento e mantenha os detalhes de impostos e edição sempre ao alcance."
  >
    <template #actions>
      <button
        type="button"
        :class="['page-shell__cta', { 'page-shell__cta--danger': showCreateForm }]"
        @click="toggleCreateForm"
      >
        <i :class="showCreateForm ? 'pi pi-times' : 'pi pi-upload'" />
        <span>{{ showCreateForm ? "Fechar cadastro" : "Enviar XML" }}</span>
      </button>
    </template>

    <Transition name="expand-fade">
      <section v-if="showCreateForm" class="panel-card launch-form-card">
        <div class="section-header">
          <div>
            <p class="section-header__eyebrow">Novo lançamento</p>
            <h2>Cadastro da nota</h2>
          </div>
        </div>

        <label class="switch-field">
          <span class="switch-field__copy">
            <strong>Não deixar preenchimento automático de contratante</strong>
            <small>
              Ative quando preferir escolher manualmente uma razão social já cadastrada.
            </small>
          </span>

          <span class="switch-field__control">
            <input v-model="manualContractorSelection" type="checkbox" />
            <span class="switch-field__track" />
          </span>
        </label>

        <div class="launch-form-layout">
          <label class="upload-dropzone upload-dropzone--input">
            <input type="file" accept=".xml" hidden @change="handleCreateFileChange" />
            <i class="pi pi-file-arrow-up" />
            <strong>{{ createFileName }}</strong>
            <p>
              Clique para selecionar o XML da nota. O sistema usará o arquivo para preencher os dados base.
            </p>
          </label>

          <div class="launch-form-side">
            <label v-if="manualContractorSelection" class="mock-field">
              <span>Razão social</span>
              <select v-model="createForm.selectedContractor" class="mock-input">
                <option
                  v-for="contractor in contractorOptions"
                  :key="contractor"
                  :value="contractor"
                >
                  {{ contractor }}
                </option>
              </select>
            </label>

            <label class="mock-field">
              <span>Receita da Contratante</span>
              <input
                v-model="createForm.contractorRevenue"
                class="mock-input"
                placeholder="Ex.: R$ 148.000,00"
              />
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="page-shell__cta" @click="saveCreateEntry">
            <i class="pi pi-check" />
            <span>Salvar lançamento</span>
          </button>
        </div>
      </section>
    </Transition>

    <section class="panel-card filter-strip">
      <div class="filter-strip__item">
        <span>Período</span>
        <strong>Março de 2026</strong>
      </div>

      <div class="filter-strip__item">
        <span>Contratante</span>
        <strong>Todos</strong>
      </div>
    </section>

    <section class="panel-grid panel-grid--stats launch-stats">
      <AppStatCard
        label="Processados"
        value="32"
        detail="Notas já conferidas e prontas para consulta."
        icon="pi pi-check"
        tone="success"
      />
      <AppStatCard
        label="Pendentes"
        value="7"
        detail="Registros aguardando complemento ou revisão."
        icon="pi pi-clock"
        tone="warn"
      />
      <AppStatCard
        label="Falhas"
        value="3"
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
              placeholder="Pesquise por razão social, status, data ou XML"
            />
          </label>
          <span class="pill">{{ filteredEntries.length }} registros</span>
        </div>
      </div>

      <div class="table-wrap">
        <table class="app-data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Razão social</th>
              <th>Meu Faturamento</th>
              <th>Total Impostos</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="entry in paginatedEntries" :key="entry.id">
              <tr>
                <td>{{ entry.date }}</td>
                <td>
                  <div class="contractor-cell">
                    <span>{{ entry.contractor }}</span>
                    <span class="info-tooltip">
                      <button
                        type="button"
                        class="info-tooltip__trigger"
                        aria-label="Ver receita da contratante"
                      >
                        <i class="pi pi-info-circle" />
                      </button>
                      <span class="info-tooltip__panel">
                        Receita da contratante neste lançamento: {{ entry.contractorRevenue }}
                      </span>
                    </span>
                  </div>
                </td>
                <td>{{ entry.myRevenue }}</td>
                <td>
                  <div class="tax-cell">
                    <span>{{ entry.taxesTotal }}</span>
                    <button
                      type="button"
                      class="table-action table-action--ghost"
                      @click="toggleTaxes(entry.id)"
                    >
                      <i :class="expandedTaxesId === entry.id ? 'pi pi-eye-slash' : 'pi pi-eye'" />
                      <span>Ver</span>
                    </button>
                  </div>
                </td>
                <td>
                  <span :class="['status-pill', `status-pill--${entry.statusTone}`]">
                    {{ entry.status }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button
                      type="button"
                      class="table-action table-action--edit"
                      @click="startEdit(entry)"
                    >
                      <i class="pi pi-pencil" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      class="table-action table-action--danger"
                      @click="askDeleteEntry(entry.id)"
                    >
                      <i class="pi pi-trash" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="expandedTaxesId === entry.id">
                <td colspan="6" class="details-row">
                  <div class="inline-panel">
                    <div class="inline-panel__header">
                      <div>
                        <p class="section-header__eyebrow">Impostos</p>
                        <h3>Composição do total de impostos</h3>
                      </div>
                    </div>

                    <div class="tax-grid">
                      <article v-for="tax in entry.taxes" :key="tax.name" class="tax-card">
                        <p>{{ tax.name }}</p>
                        <strong>{{ tax.rate }}</strong>
                        <small>{{ tax.value }}</small>
                      </article>
                    </div>
                  </div>
                </td>
              </tr>

              <tr v-if="editingEntryId === entry.id">
                <td colspan="6" class="details-row">
                  <div class="inline-panel">
                    <div class="inline-panel__header">
                      <div>
                        <p class="section-header__eyebrow">Edição</p>
                        <h3>Atualizar lançamento</h3>
                      </div>
                    </div>

                    <div class="launch-form-layout launch-form-layout--edit">
                      <label class="upload-dropzone upload-dropzone--input">
                        <input
                          type="file"
                          accept=".xml"
                          hidden
                          @change="handleEditFileChange"
                        />
                        <i class="pi pi-file-edit" />
                        <strong>{{ editFileName }}</strong>
                        <p>Troque o XML para atualizar os dados da nota.</p>
                      </label>

                      <div class="launch-form-side">
                        <label class="mock-field">
                          <span>Razão social</span>
                          <select v-model="editForm.contractor" class="mock-input">
                            <option
                              v-for="contractor in contractorOptions"
                              :key="contractor"
                              :value="contractor"
                            >
                              {{ contractor }}
                            </option>
                          </select>
                        </label>

                        <label class="mock-field">
                          <span>Receita da Contratante</span>
                          <input v-model="editForm.contractorRevenue" class="mock-input" />
                        </label>
                      </div>
                    </div>

                    <div class="table-actions">
                      <button
                        type="button"
                        class="table-action table-action--success"
                        @click="saveEdit"
                      >
                        <i class="pi pi-check" />
                        <span>Salvar edição</span>
                      </button>
                      <button
                        type="button"
                        class="table-action table-action--ghost"
                        @click="cancelEdit"
                      >
                        <i class="pi pi-times" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>

              <tr v-if="deletingEntryId === entry.id">
                <td colspan="6" class="details-row">
                  <div class="inline-panel inline-panel--danger">
                    <div class="inline-panel__header">
                      <div>
                        <p class="section-header__eyebrow">Exclusão</p>
                        <h3>Deseja realmente excluir este lançamento?</h3>
                      </div>
                    </div>

                    <p class="inline-panel__text">
                      Essa ação remove a nota da sua lista atual. Confirme somente se tiver certeza.
                    </p>

                    <div class="table-actions">
                      <button
                        type="button"
                        class="table-action table-action--danger"
                        @click="confirmDeleteEntry(entry.id)"
                      >
                        <i class="pi pi-trash" />
                        <span>Excluir lançamento</span>
                      </button>
                      <button
                        type="button"
                        class="table-action table-action--ghost"
                        @click="closeInlinePanels"
                      >
                        <i class="pi pi-times" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="table-pagination">
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
.launch-form-card {
  display: grid;
  gap: 1.25rem;
}

.switch-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(20, 32, 19, 0.07);
  border-radius: 1.4rem;
  background: rgba(245, 249, 245, 0.94);
  padding: 1rem 1.1rem;
}

.switch-field__copy {
  display: grid;
  gap: 0.25rem;
}

.switch-field__copy strong,
.switch-field__copy small {
  margin: 0;
}

.switch-field__copy small {
  color: var(--color-muted);
  line-height: 1.5;
}

.switch-field__control {
  position: relative;
  display: inline-flex;
}

.switch-field__control input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.switch-field__track {
  position: relative;
  width: 3.4rem;
  height: 2rem;
  border-radius: 999px;
  background: rgba(20, 32, 19, 0.12);
  transition: background-color 0.2s ease;
}

.switch-field__track::after {
  content: "";
  position: absolute;
  top: 0.2rem;
  left: 0.2rem;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 6px 12px rgba(20, 32, 19, 0.14);
  transition: transform 0.2s ease;
}

.switch-field__control input:checked + .switch-field__track {
  background: var(--color-brand);
}

.switch-field__control input:checked + .switch-field__track::after {
  transform: translateX(1.4rem);
}

.launch-form-layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.2fr) minmax(18rem, 0.9fr);
}

.launch-form-layout--edit {
  align-items: stretch;
}

.launch-form-side {
  display: grid;
  align-content: start;
  gap: 1rem;
}

.upload-dropzone--input {
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.launch-stats {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.section-toolbar {
  display: grid;
  gap: 1rem;
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

.contractor-cell {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.info-tooltip {
  position: relative;
  display: inline-flex;
}

.info-tooltip__trigger {
  display: grid;
  width: 1.4rem;
  height: 1.4rem;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgba(37, 99, 166, 0.12);
  color: #2563a6;
  padding: 0;
}

.info-tooltip__panel {
  position: absolute;
  left: calc(100% + 0.5rem);
  top: 50%;
  z-index: 4;
  width: 16rem;
  border: 1px solid rgba(20, 32, 19, 0.08);
  border-radius: 0.9rem;
  background: #fff;
  box-shadow: 0 18px 36px rgba(20, 32, 19, 0.12);
  color: var(--color-text);
  line-height: 1.45;
  opacity: 0;
  padding: 0.8rem 0.9rem;
  pointer-events: none;
  transform: translateY(-50%) translateX(-4px);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.info-tooltip:hover .info-tooltip__panel,
.info-tooltip:focus-within .info-tooltip__panel {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

.tax-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
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

.table-action--edit {
  background: rgba(37, 99, 166, 0.12);
  color: #2563a6;
}

.table-action--ghost {
  border-color: rgba(20, 32, 19, 0.1);
  background: #fff;
  color: var(--color-text);
}

.table-action--danger {
  background: rgba(187, 52, 52, 0.1);
  color: #ab3030;
}

.table-action--success {
  background: rgba(47, 122, 79, 0.12);
  color: var(--color-brand-strong);
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

.inline-panel--danger {
  background: rgba(255, 244, 244, 0.96);
}

.inline-panel__header h3 {
  margin: 0.35rem 0 0;
  font-size: 1.1rem;
}

.inline-panel__text {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.5;
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

.tax-card p,
.tax-card strong,
.tax-card small {
  margin: 0;
}

.tax-card p,
.tax-card small {
  color: var(--color-muted);
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
  .tax-grid {
    grid-template-columns: 1fr;
  }

  .info-tooltip__panel {
    left: 0;
    top: calc(100% + 0.4rem);
    transform: translateY(0);
  }

  .info-tooltip:hover .info-tooltip__panel,
  .info-tooltip:focus-within .info-tooltip__panel {
    transform: translateY(0);
  }
}

@media (max-width: 820px) {
  .launch-stats,
  .table-search,
  .switch-field,
  .table-pagination {
    grid-template-columns: 1fr;
    align-items: stretch;
    flex-direction: column;
  }

  .tax-cell {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
