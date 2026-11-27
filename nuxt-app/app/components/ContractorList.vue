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

    <div class="contractors-result">
      <div v-if="!pending && !contractors.length" class="empty-state empty-state--void">
        <i class="pi pi-users" />
        <div>
          <strong>Os contratantes não estão conectados a uma fonte de dados.</strong>
          <p>O cadastro e a consulta serão habilitados quando o serviço for reconstruído.</p>
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
          <button type="button" class="table-action table-action--danger" disabled>
            <i class="pi pi-trash" />
            <span>Remover</span>
          </button>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-toolbar {
  display: grid;
  gap: 1.25rem;
}

.table-search {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.contractors-result {
  padding-top: 1em;
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

@media (max-width: 900px) {
  .contractor-card-grid,
  .table-search {
    grid-template-columns: 1fr;
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
