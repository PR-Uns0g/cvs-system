<script setup lang="ts">
import type { Contractor } from "~/types/api";

useHead({
  title: "Contratantes | CVS System",
});

const { data, pending, refresh } = await useFetch("/api/contratantes", {
  key: "contractors",
});

const search = ref("");
const showCreateForm = ref(false);
const isSaving = ref(false);
const feedback = ref<{ tone: "success" | "danger"; message: string } | null>(null);

const createForm = reactive({
  legalName: "",
  document: "",
  email: "",
  phone: "",
});

const contractors = computed<Contractor[]>(() =>
  asArray(data.value).map(normalizeContractor),
);

const filteredContractors = computed(() => {
  const term = search.value.trim().toLowerCase();

  if (!term) {
    return contractors.value;
  }

  return contractors.value.filter((contractor) =>
    [
      contractor.legalName,
      contractor.document,
      contractor.document.replace(/\D/g, ""),
      contractor.email,
      contractor.phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
});

const isContractorSearchEmpty = computed(
  () => contractors.value.length > 0 && filteredContractors.value.length === 0,
);

const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value;
  feedback.value = null;
};

const resetCreateForm = () => {
  createForm.legalName = "";
  createForm.document = "";
  createForm.email = "";
  createForm.phone = "";
};

const saveNewContractor = async () => {
  feedback.value = null;
  isSaving.value = true;

  try {
    await $fetch("/api/contratantes", {
      method: "POST",
      body: {
        razao_social: createForm.legalName,
        cpf_cnpj: createForm.document,
        telefone: createForm.phone || null,
        email: createForm.email.trim() || null,
      },
    });
    resetCreateForm();
    showCreateForm.value = false;
    feedback.value = {
      tone: "success",
      message: "Contratante cadastrado com sucesso.",
    };
    await refresh();
  } catch (error: unknown) {
    feedback.value = {
      tone: "danger",
      message:
        error && typeof error === "object" && "statusMessage" in error
          ? String(error.statusMessage)
          : "Não foi possível cadastrar o contratante.",
    };
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <AppPageShell
    eyebrow="Cadastro"
    title="Contratantes"
    subtitle="Cadastre e consulte contratantes diretamente na base autenticada da API."
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

    <p
      v-if="feedback"
      :class="[
        'form-feedback',
        feedback.tone === 'success' ? 'form-feedback--success' : 'form-feedback--danger',
      ]"
    >
      {{ feedback.message }}
    </p>

    <Transition name="expand-fade">
      <form
        v-if="showCreateForm"
        class="panel-card contractor-form-card"
        @submit.prevent="saveNewContractor"
      >
        <div class="section-header">
          <div>
            <p class="section-header__eyebrow">Novo contratante</p>
            <h2>Cadastro principal</h2>
          </div>
        </div>

        <div class="contractor-form-grid">
          <label class="mock-field">
            <span>Nome social</span>
            <input v-model.trim="createForm.legalName" class="mock-input" required />
          </label>
          <label class="mock-field">
            <span>Documento</span>
            <input v-model.trim="createForm.document" class="mock-input" required />
          </label>
          <label class="mock-field">
            <span>E-mail</span>
            <input v-model.trim="createForm.email" type="email" class="mock-input" />
          </label>
          <label class="mock-field">
            <span>Telefone</span>
            <input v-model.trim="createForm.phone" class="mock-input" />
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="page-shell__cta" :disabled="isSaving">
            <i class="pi pi-check" />
            <span>{{ isSaving ? "Salvando..." : "Salvar contratante" }}</span>
          </button>
        </div>
      </form>
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
              placeholder="Pesquise por nome, documento, e-mail ou telefone"
            />
          </label>
          <span class="pill">{{ pending ? "Carregando" : `${filteredContractors.length} contratantes` }}</span>
        </div>
      </div>

      <div v-if="!pending && !contractors.length" class="empty-state empty-state--panel">
        <i class="pi pi-users" />
        <div>
          <strong>Nenhum contratante cadastrado ainda.</strong>
          <p>Cadastre o primeiro contratante para associar notas e relatórios. Nada aqui é preenchido com dados de exemplo.</p>
        </div>
      </div>

      <div v-else-if="pending" class="empty-state empty-state--panel">
        <i class="pi pi-spin pi-spinner" />
        <div>
          <strong>Carregando contratantes...</strong>
        </div>
      </div>

      <div v-else-if="isContractorSearchEmpty" class="empty-state">
        <i class="pi pi-search" />
        <div>
          <strong>Nenhum resultado para a busca.</strong>
          <p>Limpe o filtro ou tente outro termo.</p>
        </div>
      </div>

      <div v-else class="table-wrap">
        <table class="app-data-table">
          <thead>
            <tr>
              <th>Nome social</th>
              <th>Documento</th>
              <th>E-mail</th>
              <th>Telefone</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contractor in filteredContractors" :key="contractor.id">
              <td>{{ contractor.legalName }}</td>
              <td>{{ contractor.document }}</td>
              <td>{{ contractor.email }}</td>
              <td>{{ contractor.phone }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </AppPageShell>
</template>

<style scoped>
.contractor-form-card,
.section-toolbar {
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

.table-search {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.table-search .mock-field {
  flex: 1;
}

.empty-state--panel {
  border: 1px dashed rgba(20, 32, 19, 0.12);
  border-radius: 1.25rem;
  background: rgba(247, 250, 247, 0.65);
  padding: 1.35rem 1.25rem;
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
}
</style>
