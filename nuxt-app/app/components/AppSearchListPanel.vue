<script setup lang="ts">
const props = defineProps<{
  eyebrow: string;
  title: string;
  searchLabel: string;
  placeholder: string;
  countLabel: string;
  modelValue: string;
  stackAt: "820" | "900";
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const searchText = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});
</script>

<template>
  <section class="panel-card">
    <div class="section-toolbar">
      <div class="section-header">
        <div>
          <p class="section-header__eyebrow">{{ props.eyebrow }}</p>
          <h2>{{ props.title }}</h2>
        </div>
      </div>

      <div :class="['table-search', `table-search--stack-${props.stackAt}`]">
        <label class="mock-field">
          <span>{{ props.searchLabel }}</span>
          <input v-model="searchText" class="mock-input" :placeholder="props.placeholder" />
        </label>
        <span class="pill">{{ props.countLabel }}</span>
      </div>
    </div>

    <div class="search-list-panel__results">
      <slot name="results" />
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

.table-search .mock-field {
  flex: 1;
}

.search-list-panel__results {
  padding-top: 1em;
}

@media (max-width: 820px) {
  .table-search--stack-820 {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 900px) {
  .table-search--stack-900 {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
