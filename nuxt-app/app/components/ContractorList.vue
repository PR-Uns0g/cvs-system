<script setup lang="ts">
import type { Contractor } from "~/types/domain";

const props = defineProps<{
  contractors: Contractor[];
  pending: boolean;
}>();

const search = ref("");
const filteredContractors = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return props.contractors;
  return props.contractors.filter((contractor) =>
    [contractor.legalName, contractor.document, contractor.email, contractor.phone]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
});
const isContractorSearchEmpty = computed(
  () => props.contractors.length > 0 && filteredContractors.value.length === 0,
);
</script>

<template>
  <AppSearchListPanel
    v-model="search"
    eyebrow="Base ativa"
    title="Contratantes cadastrados"
    search-label="Buscar contratante"
    placeholder="Pesquise por nome, documento, e-mail ou telefone"
    :count-label="pending ? 'Carregando' : `${filteredContractors.length} contratantes`"
    stack-at="900"
  >
    <template #results>
      <AppEmptyState
        v-if="!pending && !contractors.length"
        variant="void"
        icon="pi pi-users"
        title="Os contratantes não estão conectados a uma fonte de dados."
        description="O cadastro e a consulta serão habilitados quando o serviço for reconstruído."
      />
      <AppEmptyState
        v-else-if="pending"
        variant="loading"
        icon="pi pi-spin pi-spinner"
        title="Carregando contratantes..."
      />
      <AppEmptyState
        v-else-if="isContractorSearchEmpty"
        variant="search"
        icon="pi pi-search"
        title="Nenhum resultado para a busca."
        description="Limpe o filtro ou tente outro termo."
      />

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
          <button type="button" class="table-action table-action--danger" disabled>
            <i class="pi pi-trash" />
            <span>Remover</span>
          </button>
        </article>
      </div>
    </template>
  </AppSearchListPanel>
</template>

<style scoped>
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

@media (max-width: 900px) {
  .contractor-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
