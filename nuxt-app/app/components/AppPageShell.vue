<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle: string
}>()
</script>

<template>
  <section class="page-shell">
    <header class="page-shell__header">
      <div class="page-shell__intro">
        <p v-if="eyebrow" class="page-shell__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>

      <div v-if="$slots.actions" class="page-shell__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="page-shell__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.page-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-shell__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.page-shell__intro {
  max-width: 50rem;
}

.page-shell__eyebrow {
  margin: 0 0 0.55rem;
  color: var(--color-brand);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-shell__intro h1 {
  margin: 0;
  font-size: clamp(2rem, 2vw + 1rem, 2.75rem);
  line-height: 1.05;
}

.page-shell__intro p {
  margin: 0.8rem 0 0;
  max-width: 42rem;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1.6;
}

.page-shell__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-shell__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (max-width: 900px) {
  .page-shell__header {
    align-items: stretch;
    flex-direction: column;
  }

  .page-shell__actions {
    flex-wrap: wrap;
  }
}
</style>
