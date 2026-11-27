<script setup lang="ts">
import { formatCellphoneInput, formatCnpjInput } from "~/utils/formatters";

defineProps<{
  visible: boolean;
}>();

const createForm = reactive({ legalName: "", document: "", email: "", phone: "" });

const onDocumentInput = (event: Event) => {
  createForm.document = formatCnpjInput((event.target as HTMLInputElement).value);
};
const onPhoneInput = (event: Event) => {
  createForm.phone = formatCellphoneInput((event.target as HTMLInputElement).value);
};
</script>

<template>
  <Transition name="expand-fade">
    <form v-if="visible" class="panel-card contractor-form-card" @submit.prevent>
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
        <button type="button" class="page-shell__cta" disabled>
          <i class="pi pi-check" />
          <span>Salvar contratante</span>
        </button>
      </div>
    </form>
  </Transition>
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
  .contractor-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
