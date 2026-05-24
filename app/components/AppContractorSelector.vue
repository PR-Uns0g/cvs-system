<script setup lang="ts">
import type { Contractor } from "~/types/api";

const ALL_CONTRACTORS = "all";

const props = withDefaults(
  defineProps<{
    contractors: Contractor[];
    modelValue?: string;
    disabled?: boolean;
    includeAll?: boolean;
    placeholder?: string;
  }>(),
  {
    modelValue: ALL_CONTRACTORS,
    disabled: false,
    includeAll: true,
    placeholder: "Selecione um contratante",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const options = computed(() => {
  const list = props.contractors.map((contractor) => ({
    label: contractor.legalName,
    value: String(contractor.id),
    helper: contractor.document,
  }));

  if (props.includeAll) {
    return [
      { label: "Todos os contratantes", value: ALL_CONTRACTORS, helper: "Visão consolidada" },
      ...list,
    ];
  }

  return list;
});

const hasContractors = computed(() => props.contractors.length > 0);

const selected = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value ?? ""),
});
</script>

<template>
  <Select
    v-model="selected"
    :options="options"
    option-label="label"
    option-value="value"
    :disabled="disabled || !hasContractors"
    :placeholder="hasContractors ? placeholder : 'Nenhum contratante cadastrado'"
    class="app-select app-contractor-select"
    panel-class="app-select-panel"
  >
    <template #option="{ option }">
      <div class="app-contractor-select__option">
        <span>{{ option.label }}</span>
        <small v-if="option.helper">{{ option.helper }}</small>
      </div>
    </template>
  </Select>
</template>

<style scoped>
.app-contractor-select {
  width: 100%;
}

.app-contractor-select__option {
  display: grid;
  gap: 0.15rem;
}

.app-contractor-select__option small {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 600;
}
</style>
