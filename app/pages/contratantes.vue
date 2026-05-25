<script setup lang="ts">
import type { Contractor } from "~/types/api";
import { digitsOnly, formatCellphoneInput, formatCnpjInput } from "~/utils/formatters";

useHead({
  title: "Contratantes | CVS System",
});

const contractorQuery = ref<Record<string, string>>({});

const { data, pending, refresh } = await useApiFetch("/api/contratantes", {
  key: "contractors",
  query: contractorQuery,
});

const search = ref("");
const showCreateForm = ref(false);
const isSaving = ref(false);
const deletingId = ref<string | number | null>(null);
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

const applyContractorPeriod = (period: {
  period_start: string;
  period_end: string;
}) => {
  contractorQuery.value = {
    period_start: period.period_start,
    period_end: period.period_end,
  };
};

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

const onDocumentInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  createForm.document = formatCnpjInput(target.value);
};

const onPhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  createForm.phone = formatCellphoneInput(target.value);
};

const saveNewContractor = async () => {
  feedback.value = null;
  isSaving.value = true;

  try {
    await useRequestFetch()("/api/contratantes", {
      method: "POST",
      body: {
        legalName: createForm.legalName,
        document: digitsOnly(createForm.document),
        phone: createForm.phone ? digitsOnly(createForm.phone) : null,
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

const deleteContractor = async (contractor: Contractor) => {
  feedback.value = null;
  deletingId.value = contractor.id;

  try {
    await useRequestFetch()(`/api/contratantes/${contractor.id}`, {
      method: "DELETE",
    });
    feedback.value = {
      tone: "success",
      message: "Contratante removido com sucesso.",
    };
    await refresh();
  } catch (error: unknown) {
    feedback.value = {
      tone: "danger",
      message:
        error && typeof error === "object" && "statusMessage" in error
          ? String(error.statusMessage)
          : "Não foi possível remover o contratante.",
    };
  } finally {
    deletingId.value = null;
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
            <span>Documento (CNPJ)</span>
            <input
              v-model="createForm.document"
              class="mock-input"
              inputmode="numeric"
              placeholder="00.000.000/0000-00"
              required
              @input="onDocumentInput"
            />
          </label>
          <label class="mock-field">
            <span>E-mail</span>
            <input v-model.trim="createForm.email" type="email" class="mock-input" />
          </label>
          <label class="mock-field">
            <span>Telefone</span>
            <input
              v-model="createForm.phone"
              class="mock-input"
              inputmode="tel"
              placeholder="(00) 00000-0000"
              @input="onPhoneInput"
            />
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

    <section class="panel-card filter-strip">
      <div class="filter-strip__item">
        <span>Período</span>
        <AppPeriodSelector
          :disabled="pending"
          :emit-on-mount="false"
          @change="applyContractorPeriod"
        />
        <p class="period-hint">
          Sem período selecionado, todos os contratantes vinculados são listados. Com período,
          aparecem só os que tiveram lançamento no intervalo.
        </p>
      </div>
    </section>

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

      <div v-if="!pending && !contractors.length" class="empty-state empty-state--void">
        <i class="pi pi-users" />
        <div>
          <strong>Nenhum contratante cadastrado ainda.</strong>
          <p>Cadastre o primeiro contratante para associar notas e relatórios. Nada aqui é preenchido com dados de exemplo.</p>
        </div>
      </div>

      <div v-else-if="pending" class="empty-state empty-state--loading">
        <i class="pi pi-spin pi-spinner" />
        <div>
          <strong>Carregando contratantes...</strong>
        </div>
      </div>

      <div v-else-if="isContractorSearchEmpty" class="empty-state empty-state--search">
        <i class="pi pi-search" />
        <div>
          <strong>Nenhum resultado para a busca.</strong>
          <p>Limpe o filtro ou tente outro termo.</p>
        </div>
      </div>

      <div v-else class="contractor-card-grid">
        <article
          v-for="contractor in filteredContractors"
          :key="contractor.id"
          class="contractor-card"
        >
          <div>
            <p class="section-header__eyebrow">Contratante</p>
            <h3>{{ contractor.legalName }}</h3>
          </div>
          <dl>
            <div>
              <dt>Documento</dt>
              <dd>{{ contractor.document }}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{{ contractor.email }}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{{ contractor.phone }}</dd>
            </div>
          </dl>
          <button
            type="button"
            class="table-action table-action--danger"
            :disabled="deletingId === contractor.id"
            @click="deleteContractor(contractor)"
          >
            <i class="pi pi-trash" />
            <span>{{ deletingId === contractor.id ? "Removendo" : "Remover" }}</span>
          </button>
        </article>
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

.table-action--danger {
  border-color: rgba(187, 52, 52, 0.14);
  background: rgba(187, 52, 52, 0.08);
  color: #ab3030;
}

.contractor-card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.contractor-card {
  display: grid;
  gap: 1rem;
  border: 1px solid rgba(20, 32, 19, 0.08);
  border-radius: 1rem;
  background: #fff;
  padding: 1.1rem;
}

.contractor-card h3,
.contractor-card dl,
.contractor-card dd,
.contractor-card p {
  margin: 0;
}

.contractor-card dl {
  display: grid;
  gap: 0.7rem;
}

.contractor-card dt {
  color: var(--color-muted);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.contractor-card dd {
  overflow-wrap: anywhere;
}

.period-hint {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
  font-size: 0.82rem;
  line-height: 1.45;
  max-width: 42rem;
}

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
  .contractor-card-grid,
  .table-search {
    grid-template-columns: 1fr;
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
