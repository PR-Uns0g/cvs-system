<script setup lang="ts">
import type { LaunchEntry, TaxDetail } from "~/types/domain";

const props = defineProps<{
  entries: LaunchEntry[];
  pending: boolean;
}>();

const search = ref("");
const currentPage = ref(1);
const pageSize = 10;
const expandedTaxesId = ref<string | number | null>(null);

const filteredEntries = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return props.entries;
  return props.entries.filter((entry) =>
    [entry.date, entry.contractor, entry.status, entry.xmlLabel]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
});
const isSearchEmpty = computed(
  () => props.entries.length > 0 && filteredEntries.value.length === 0,
);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredEntries.value.length / pageSize)));
const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredEntries.value.slice(start, start + pageSize);
});

watch(search, () => (currentPage.value = 1));
watch(filteredEntries, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
});

const toggleTaxes = (entryId: string | number) => {
  expandedTaxesId.value = expandedTaxesId.value === entryId ? null : entryId;
};
const previousPage = () => (currentPage.value = Math.max(1, currentPage.value - 1));
const nextPage = () => (currentPage.value = Math.min(totalPages.value, currentPage.value + 1));
const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatTotalRateOverInvoice = (entry: LaunchEntry) =>
  entry.myRevenueNumber <= 0
    ? "—"
    : `${percentFormatter.format((entry.taxesTotalNumber / entry.myRevenueNumber) * 100)}%`;
const formatRateOverInvoice = (tax: TaxDetail, nf: number) =>
  nf <= 0 ? "—" : `${percentFormatter.format((tax.valueNumber / nf) * 100)}%`;
</script>

<template>
  <AppSearchListPanel
    v-model="search"
    eyebrow="Listagem"
    title="Todos os lançamentos"
    search-label="Buscar lançamentos"
    placeholder="Pesquise por contratante, status, data ou XML"
    :count-label="pending ? 'Carregando' : `${filteredEntries.length} registros`"
    stack-at="820"
  >
    <template #results>
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
                  <span :class="['status-pill', `status-pill--${entry.statusTone}`]">
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
                    <i :class="expandedTaxesId === entry.id ? 'pi pi-eye-slash' : 'pi pi-eye'" />
                    <span>Ver</span>
                  </button>
                </td>
                <td>
                  <button type="button" class="table-action table-action--danger" disabled>
                    <i class="pi pi-trash" />
                    <span>Remover</span>
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
                        <span class="tax-panel-summary__label">Alíquota total (sobre NF)</span>
                        <span class="tax-panel-summary__value">{{ formatTotalRateOverInvoice(entry) }}</span>
                        <span class="tax-panel-summary__hint">
                          Percentual do total de impostos em relação ao valor da sua nota.
                        </span>
                      </p>
                    </div>
  
                    <div class="tax-grid">
                      <article v-for="tax in entry.taxes" :key="tax.name" class="tax-card">
                        <p class="tax-card__name">{{ tax.name }}</p>
                        <strong class="tax-card__value">{{ tax.value }}</strong>
                        <small v-if="tax.rate !== '-'" class="tax-card__declared">Declarada: {{ tax.rate }}</small>
                        <small class="tax-card__aliquota">
                          Alíquota: {{ formatRateOverInvoice(tax, entry.myRevenueNumber) }}
                        </small>
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
        <button type="button" class="table-action table-action--ghost" :disabled="currentPage === 1" @click="previousPage">
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
    </template>
  </AppSearchListPanel>
</template>

<style scoped>
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

@media (max-width: 1100px) {
  .tax-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .table-pagination {
    grid-template-columns: 1fr;
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
