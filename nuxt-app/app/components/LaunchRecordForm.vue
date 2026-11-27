<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
}>();

const activeInputMode = ref<"invoice" | "manual">("invoice");
const selectedFile = shallowRef<File | null>(null);
const manualForm = reactive({
  amount: "",
  source: "",
  description: "",
  direction: "GAIN" as "GAIN" | "LOSS",
});
const submitting = ref(false);
const submissionError = ref("");
const submissionMessage = ref("");
const fileName = computed(() => selectedFile.value?.name || "Selecione o XML da nota");

const setActiveInputMode = (mode: "invoice" | "manual") => {
  activeInputMode.value = mode;
  submissionError.value = "";
  submissionMessage.value = "";
};

const handleCreateFileChange = (event: Event) => {
  selectedFile.value = (event.target as HTMLInputElement).files?.[0] || null;
};

const submitRecord = async (body: Record<string, string> | Blob) => {
  submitting.value = true;
  submissionError.value = "";
  submissionMessage.value = "";

  try {
    await $fetch("/api/records", {
      method: "POST",
      body,
    });
    submissionMessage.value = "Solicitação enviada.";
  } catch (error) {
    submissionError.value =
      error instanceof Error ? error.message : "Não foi possível enviar o lançamento.";
  } finally {
    submitting.value = false;
  }
};

const submitManualRecord = () =>
  submitRecord({
    type: "MANUAL",
    amount: manualForm.amount,
    direction: manualForm.direction,
    source: manualForm.source,
    description: manualForm.description,
  });

const submitInvoiceRecord = async () => {
  if (!selectedFile.value) {
    submissionError.value = "Selecione um arquivo XML antes de enviar.";
    return;
  }

  if (selectedFile.value.size > 5_000_000) {
    submissionError.value = "O arquivo XML deve ter no máximo 5 MB.";
    return;
  }

  await submitRecord(new Blob([selectedFile.value], { type: "application/xml" }));
};

const submitActiveRecord = () =>
  activeInputMode.value === "invoice" ? submitInvoiceRecord() : submitManualRecord();
</script>

<template>
  <div>
    <Transition name="expand-fade">
      <form
        v-if="props.visible"
        class="panel-card launch-form-card"
        @submit.prevent="submitActiveRecord"
      >
        <div class="record-mode-tabs" role="group" aria-label="Modo de cadastro">
          <button
            type="button"
            class="record-mode-tabs__tab"
            :class="{ 'record-mode-tabs__tab--active': activeInputMode === 'invoice' }"
            :aria-pressed="activeInputMode === 'invoice'"
            @click="setActiveInputMode('invoice')"
          >
            <i class="pi pi-upload" />
            <span>Enviar XML</span>
          </button>
          <button
            type="button"
            class="record-mode-tabs__tab"
            :class="{ 'record-mode-tabs__tab--active': activeInputMode === 'manual' }"
            :aria-pressed="activeInputMode === 'manual'"
            @click="setActiveInputMode('manual')"
          >
            <i class="pi pi-pencil" />
            <span>Preencher manualmente</span>
          </button>
        </div>

        <div class="section-header">
          <div>
            <p class="section-header__eyebrow">Novo lançamento</p>
            <h2>{{ activeInputMode === "invoice" ? "Importação da nota" : "Cadastro manual" }}</h2>
          </div>
        </div>

        <div v-if="activeInputMode === 'invoice'" class="record-mode-panel">
          <p class="launch-form-hint">
            Envie o XML da nota. A origem será definida automaticamente como “nf”.
          </p>
          <div class="launch-form-layout">
            <label class="upload-dropzone upload-dropzone--input">
              <input
                type="file"
                accept=".xml,application/xml,text/xml"
                required
                hidden
                @change="handleCreateFileChange"
              />
              <i class="pi pi-file-arrow-up" />
              <strong>{{ fileName }}</strong>
              <p>Clique para selecionar o XML da nota.</p>
            </label>
          </div>
        </div>

        <div v-else class="record-mode-panel">
          <p class="launch-form-hint">
            Informe os dados do lançamento manual. Não há contratante associado.
          </p>
          <div class="manual-form-grid">
            <label class="mock-field">
              <span>Tipo*</span>
              <select v-model="manualForm.direction" class="mock-input" required>
                <option value="GAIN">Entrada</option>
                <option value="LOSS">Saída</option>
              </select>
            </label>

            <label class="mock-field">
              <span>Valor*</span>
              <input
                v-model.trim="manualForm.amount"
                class="mock-input"
                type="number"
                min="0.01"
                step="0.01"
                inputmode="decimal"
                required
              />
            </label>

            <label class="mock-field">
              <span>Origem*</span>
              <input
                v-model.trim="manualForm.source"
                class="mock-input"
                type="text"
                required
                placeholder="Ex: dívida, pagamento, familiar, etc."
              />
            </label>

            <label class="mock-field">
              <span>Descrição</span>
              <textarea
                v-model.trim="manualForm.description"
                class="mock-input"
                placeholder="Pagamento recebido pelo fulano de tal"
              />
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="page-shell__cta"
            :disabled="submitting || (activeInputMode === 'invoice' && !selectedFile)"
          >
            <i class="pi pi-check" />
            <span>
              {{
                submitting
                  ? "Enviando..."
                  : activeInputMode === "invoice"
                    ? "Enviar XML"
                    : "Enviar lançamento manual"
              }}
            </span>
          </button>
        </div>
      </form>
    </Transition>

    <p v-if="submissionError" class="launch-form-message launch-form-message--error" role="alert">
      {{ submissionError }}
    </p>
    <p v-if="submissionMessage" class="launch-form-message" role="status">
      {{ submissionMessage }}
    </p>
  </div>
</template>

<style scoped>
.launch-form-card {
  display: grid;
  gap: 1.25rem;
}

.record-mode-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(20, 32, 19, 0.1);
}

.record-mode-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0.75rem 1rem;
}

.record-mode-tabs__tab--active {
  border-bottom-color: var(--color-brand-strong);
  color: var(--color-brand-strong);
}

.record-mode-tabs__tab:focus-visible {
  outline: 2px solid var(--color-brand-strong);
  outline-offset: -2px;
}

.record-mode-panel {
  display: grid;
  gap: 1rem;
}

.launch-form-hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.95rem;
  line-height: 1.55;
}

.launch-form-layout {
  display: grid;
  gap: 1rem;
}

.manual-form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.launch-form-message {
  margin: 0;
  color: var(--color-brand-strong);
}

.launch-form-message--error {
  color: #ab3030;
}

.upload-dropzone--input {
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
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
  .manual-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
