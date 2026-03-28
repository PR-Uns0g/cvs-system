<script setup lang="ts">
type Contractor = {
  id: number;
  legalName: string;
  document: string;
  email: string;
  phone: string;
};

useHead({
  title: "Contratantes | CVS System",
});

const contractors = ref<Contractor[]>([
  {
    id: 1,
    legalName: "Nova Era Distribuidora",
    document: "12.345.678/0001-90",
    email: "financeiro@novaera.com.br",
    phone: "(11) 3888-2200",
  },
  {
    id: 2,
    legalName: "Comercial Horizonte",
    document: "45.990.210/0001-13",
    email: "contato@horizonte.com.br",
    phone: "(11) 4002-9922",
  },
  {
    id: 3,
    legalName: "Atacado Sao Jorge",
    document: "22.330.450/0001-07",
    email: "cadastro@sjorge.com.br",
    phone: "(19) 3254-8801",
  },
  {
    id: 4,
    legalName: "Central Alimentos",
    document: "17.882.100/0001-65",
    email: "relacao@central.com.br",
    phone: "(21) 3771-2090",
  },
]);

const search = ref("");
const showCreateForm = ref(false);
const deletePopoverId = ref<number | null>(null);

const createForm = reactive({
  legalName: "",
  document: "",
  email: "",
  phone: "",
});

const editingId = ref<number | null>(null);
const editDraft = reactive({
  legalName: "",
  document: "",
  email: "",
  phone: "",
});

const filteredContractors = computed(() => {
  const term = search.value.trim().toLowerCase();

  if (!term) {
    return contractors.value;
  }

  return contractors.value.filter((contractor) =>
    [
      contractor.legalName,
      contractor.document,
      contractor.email,
      contractor.phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
});

const activeEditingContractor = computed(() =>
  contractors.value.find((contractor) => contractor.id === editingId.value) ?? null,
);

const hasEditChanges = computed(() => {
  if (!activeEditingContractor.value) {
    return false;
  }

  return (
    activeEditingContractor.value.legalName !== editDraft.legalName ||
    activeEditingContractor.value.document !== editDraft.document ||
    activeEditingContractor.value.email !== editDraft.email ||
    activeEditingContractor.value.phone !== editDraft.phone
  );
});

const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value;
};

const saveNewContractor = () => {
  contractors.value.unshift({
    id: Date.now(),
    legalName: createForm.legalName || "Novo contratante",
    document: createForm.document || "00.000.000/0000-00",
    email: createForm.email || "contato@contratante.com.br",
    phone: createForm.phone || "(00) 0000-0000",
  });

  createForm.legalName = "";
  createForm.document = "";
  createForm.email = "";
  createForm.phone = "";
  showCreateForm.value = false;
};

const startEdit = (contractor: Contractor) => {
  deletePopoverId.value = null;
  editingId.value = contractor.id;
  editDraft.legalName = contractor.legalName;
  editDraft.document = contractor.document;
  editDraft.email = contractor.email;
  editDraft.phone = contractor.phone;
};

const confirmEdit = () => {
  if (!activeEditingContractor.value || !hasEditChanges.value) {
    return;
  }

  activeEditingContractor.value.legalName = editDraft.legalName;
  activeEditingContractor.value.document = editDraft.document;
  activeEditingContractor.value.email = editDraft.email;
  activeEditingContractor.value.phone = editDraft.phone;
  editingId.value = null;
};

const cancelEdit = () => {
  editingId.value = null;
};

const toggleDeletePopover = (contractorId: number) => {
  if (editingId.value !== null) {
    return;
  }

  deletePopoverId.value = deletePopoverId.value === contractorId ? null : contractorId;
};

const confirmDeleteContractor = (
  contractorId: number,
  _mode: "only" | "with-launches",
) => {
  contractors.value = contractors.value.filter(
    (contractor) => contractor.id !== contractorId,
  );
  deletePopoverId.value = null;
};
</script>

<template>
  <AppPageShell
    eyebrow="Cadastro"
    title="Contratantes"
    subtitle="Cadastre, edite e consulte contratantes com uma lista clara e um formulário amplo, sem dividir a atenção em painéis desnecessários."
  >
    <template #actions>
      <button
        type="button"
        :class="['page-shell__cta', { 'page-shell__cta--danger': showCreateForm }]"
        @click="toggleCreateForm"
      >
        <i :class="showCreateForm ? 'pi pi-times' : 'pi pi-plus'" />
        <span>{{ showCreateForm ? "Fechar formulário" : "Novo Contratante" }}</span>
      </button>
    </template>

    <Transition name="expand-fade">
      <section v-if="showCreateForm" class="panel-card contractor-form-card">
        <div class="section-header">
          <div>
            <p class="section-header__eyebrow">Novo contratante</p>
            <h2>Cadastro principal</h2>
          </div>
        </div>

        <div class="contractor-form-grid">
          <label class="mock-field">
            <span>Razão social</span>
            <input v-model="createForm.legalName" class="mock-input" />
          </label>
          <label class="mock-field">
            <span>CPF/CNPJ</span>
            <input v-model="createForm.document" class="mock-input" />
          </label>
          <label class="mock-field">
            <span>E-mail</span>
            <input v-model="createForm.email" class="mock-input" />
          </label>
          <label class="mock-field">
            <span>Telefone</span>
            <input v-model="createForm.phone" class="mock-input" />
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="page-shell__cta" @click="saveNewContractor">
            <i class="pi pi-check" />
            <span>Salvar contratante</span>
          </button>
        </div>
      </section>
    </Transition>

    <section class="panel-card">
      <div class="section-toolbar">
        <div class="section-header">
          <div>
            <p class="section-header__eyebrow">Base ativa</p>
            <h2>Contratantes cadastrados</h2>
          </div>
        </div>

        <div class="table-search">
          <label class="mock-field">
            <span>Buscar contratante</span>
            <input
              v-model="search"
              class="mock-input"
              placeholder="Pesquise por razão social, documento, e-mail ou telefone"
            />
          </label>
          <span class="pill">{{ filteredContractors.length }} contratantes</span>
        </div>
      </div>

      <div class="table-wrap">
        <table class="app-data-table">
          <thead>
            <tr>
              <th>Razão social</th>
              <th>Documento</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="contractor in filteredContractors"
              :key="contractor.id"
              :class="{ 'table-row--editing': editingId === contractor.id }"
            >
              <td>
                <input
                  v-if="editingId === contractor.id"
                  v-model="editDraft.legalName"
                  class="inline-edit-input"
                />
                <template v-else>{{ contractor.legalName }}</template>
              </td>
              <td>
                <input
                  v-if="editingId === contractor.id"
                  v-model="editDraft.document"
                  class="inline-edit-input"
                />
                <template v-else>{{ contractor.document }}</template>
              </td>
              <td>
                <input
                  v-if="editingId === contractor.id"
                  v-model="editDraft.email"
                  class="inline-edit-input"
                />
                <template v-else>{{ contractor.email }}</template>
              </td>
              <td>
                <input
                  v-if="editingId === contractor.id"
                  v-model="editDraft.phone"
                  class="inline-edit-input"
                />
                <template v-else>{{ contractor.phone }}</template>
              </td>
              <td>
                <div class="table-actions">
                  <template v-if="editingId === contractor.id">
                    <button
                      type="button"
                      class="table-action table-action--success"
                      :disabled="!hasEditChanges"
                      @click="confirmEdit"
                    >
                      <i class="pi pi-check" />
                      <span>Confirmar</span>
                    </button>
                    <button
                      type="button"
                      class="table-action table-action--ghost"
                      @click="cancelEdit"
                    >
                      <i class="pi pi-times" />
                      <span>Cancelar</span>
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="table-action table-action--secondary"
                      :disabled="editingId !== null && editingId !== contractor.id"
                      @click="startEdit(contractor)"
                    >
                      <i class="pi pi-pencil" />
                      <span>Editar</span>
                    </button>

                    <div class="delete-popover-wrap">
                      <button
                        type="button"
                        class="table-action table-action--danger"
                        :disabled="editingId !== null"
                        @click="toggleDeletePopover(contractor.id)"
                      >
                        <i class="pi pi-trash" />
                        <span>Excluir</span>
                      </button>

                      <Transition name="fade-slide">
                        <div
                          v-if="deletePopoverId === contractor.id"
                          class="delete-popover"
                        >
                          <p class="delete-popover__title">Como deseja excluir?</p>
                          <button
                            type="button"
                            class="delete-popover__action"
                            @click="confirmDeleteContractor(contractor.id, 'only')"
                          >
                            Excluir somente o contratante
                          </button>
                          <button
                            type="button"
                          class="delete-popover__action delete-popover__action--danger"
                          @click="confirmDeleteContractor(contractor.id, 'with-launches')"
                        >
                          Excluir contratante e lançamentos
                        </button>
                          <button
                            type="button"
                            class="delete-popover__dismiss"
                            @click="deletePopoverId = null"
                          >
                            Cancelar
                          </button>
                        </div>
                      </Transition>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </AppPageShell>
</template>

<style scoped>
.contractor-form-card {
  display: grid;
  gap: 1.25rem;
}

.contractor-form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-actions {
  display: flex;
  justify-content: flex-end;
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

.table-row--editing {
  background: rgba(47, 122, 79, 0.05);
}

.inline-edit-input {
  width: 100%;
  border: 1px solid rgba(47, 122, 79, 0.16);
  border-radius: 0.9rem;
  background: #fff;
  padding: 0.7rem 0.8rem;
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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

.table-action--secondary {
  background: rgba(47, 122, 79, 0.08);
  color: var(--color-brand-strong);
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

.delete-popover-wrap {
  position: relative;
}

.delete-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 0.55rem);
  z-index: 3;
  display: grid;
  gap: 0.55rem;
  min-width: 18rem;
  padding: 0.85rem;
  border: 1px solid rgba(20, 32, 19, 0.08);
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 18px 40px rgba(20, 32, 19, 0.12);
}

.delete-popover__title {
  margin: 0;
  color: var(--color-text-strong);
  font-weight: 700;
}

.delete-popover__action,
.delete-popover__dismiss {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 0.9rem;
  padding: 0.78rem 0.9rem;
  text-align: left;
  font-weight: 700;
}

.delete-popover__action {
  background: rgba(47, 122, 79, 0.08);
  color: var(--color-brand-strong);
}

.delete-popover__action--danger {
  background: rgba(187, 52, 52, 0.1);
  color: #ab3030;
}

.delete-popover__dismiss {
  border-color: rgba(20, 32, 19, 0.08);
  background: #fff;
  color: var(--color-text);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
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
  max-height: 50rem;
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 900px) {
  .contractor-form-grid,
  .table-search {
    grid-template-columns: 1fr;
    align-items: stretch;
    flex-direction: column;
  }

  .delete-popover {
    left: 0;
    right: auto;
  }
}
</style>
