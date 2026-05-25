<script setup lang="ts">
type PeriodOption = "90" | "30" | "15" | "7" | "custom";

type PeriodPreset = {
  label: string;
  value: PeriodOption;
};

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    initialOption?: PeriodOption;
    /** When false, period is only sent after the user changes the selector (e.g. contratantes list-all). */
    emitOnMount?: boolean;
  }>(),
  {
    disabled: false,
    initialOption: "30",
    emitOnMount: true,
  },
);

const emit = defineEmits<{
  change: [period: { period_start: string; period_end: string; label: string }];
}>();

const presetOptions: PeriodPreset[] = [
  { label: "Últimos 90 dias", value: "90" },
  { label: "Últimos 30 dias", value: "30" },
  { label: "Últimos 15 dias", value: "15" },
  { label: "Últimos 7 dias", value: "7" },
  { label: "Período personalizado", value: "custom" },
];

const option = ref<PeriodOption>(props.initialOption);
const isCustomOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const toLocalDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayKey = () => toLocalDateKey(new Date());

const daysAgoKey = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days + 1);
  return toLocalDateKey(date);
};

const parseDateKey = (value: string) => {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toDateKey = (date: Date | null | undefined) => {
  if (!date) {
    return "";
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const customStart = ref<Date | null>(parseDateKey(daysAgoKey(30)));
const customEnd = ref<Date | null>(parseDateKey(todayKey()));

const emitPreset = (days: number) => {
  emit("change", {
    period_start: daysAgoKey(days),
    period_end: todayKey(),
    label: `Últimos ${days} dias`,
  });
};

const applyCustom = () => {
  const start = toDateKey(customStart.value);
  const end = toDateKey(customEnd.value);

  if (!start || !end) {
    return;
  }

  const [periodStart, periodEnd] = start <= end ? [start, end] : [end, start];

  emit("change", {
    period_start: periodStart,
    period_end: periodEnd,
    label: `${periodStart} a ${periodEnd}`,
  });
  isCustomOpen.value = false;
};

const onOptionChange = (value: PeriodOption) => {
  if (value === "custom") {
    if (!customStart.value) {
      customStart.value = parseDateKey(daysAgoKey(30));
    }
    if (!customEnd.value) {
      customEnd.value = parseDateKey(todayKey());
    }
    isCustomOpen.value = true;
    return;
  }

  isCustomOpen.value = false;
  emitPreset(Number(value));
};

const onDocumentPointerDown = (event: PointerEvent) => {
  if (!isCustomOpen.value || !rootRef.value) {
    return;
  }

  const target = event.target as HTMLElement;

  if (rootRef.value.contains(target)) {
    return;
  }

  if (target.closest(".p-datepicker-panel, .p-select-overlay, .p-datepicker")) {
    return;
  }

  isCustomOpen.value = false;
};

onMounted(() => {
  if (props.emitOnMount && option.value !== "custom") {
    emitPreset(Number(option.value));
  }
  document.addEventListener("pointerdown", onDocumentPointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
});
</script>

<template>
  <div ref="rootRef" class="period-selector">
    <Select
      v-model="option"
      :options="presetOptions"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      class="app-select period-selector__select"
      panel-class="app-select-panel"
      @update:model-value="onOptionChange"
    />

    <Transition name="period-popover">
      <div v-if="isCustomOpen" class="period-popover">
        <p class="period-popover__title">Escolha o intervalo</p>

        <div class="period-popover__dates">
          <label class="mock-field">
            <span>Data inicial</span>
            <DatePicker
              v-model="customStart"
              date-format="dd/mm/yy"
              show-icon
              icon-display="input"
              append-to="self"
              :max-date="customEnd ?? undefined"
              class="app-datepicker"
              input-class="mock-input"
            />
          </label>
          <label class="mock-field">
            <span>Data final</span>
            <DatePicker
              v-model="customEnd"
              date-format="dd/mm/yy"
              show-icon
              icon-display="input"
              append-to="self"
              :min-date="customStart ?? undefined"
              class="app-datepicker"
              input-class="mock-input"
            />
          </label>
        </div>

        <div class="period-popover__actions">
          <span v-if="customStart && customEnd">
            {{ toDateKey(customStart) }} a {{ toDateKey(customEnd) }}
          </span>
          <button type="button" class="secondary-action" @click="applyCustom">
            <i class="pi pi-check" />
            <span>Aplicar</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.period-selector {
  position: relative;
}

.period-selector__select {
  width: 100%;
}

.period-popover {
  position: absolute;
  z-index: 30;
  top: calc(100% + 0.6rem);
  left: 0;
  display: grid;
  width: min(32rem, calc(100vw - 2rem));
  gap: 1rem;
  border: 1px solid rgba(47, 122, 79, 0.14);
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 24px 50px rgba(16, 24, 17, 0.14);
  padding: 1rem;
}

.period-popover__title {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.period-popover__dates {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.period-popover__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.period-popover__actions > span {
  color: var(--color-muted);
  font-weight: 800;
}

.period-popover-enter-active,
.period-popover-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.period-popover-enter-from,
.period-popover-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 720px) {
  .period-popover {
    position: static;
    width: 100%;
    margin-top: 0.65rem;
  }

  .period-popover__dates {
    grid-template-columns: 1fr;
  }
}
</style>
