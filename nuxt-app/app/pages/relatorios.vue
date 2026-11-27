<script setup lang="ts">
useHead({ title: "Relatórios | CVS System" });
</script>

<template>
  <AppPageShell
    eyebrow="Configuração"
    title="Relatórios"
    subtitle="Prévia visual das opções de configuração de relatórios."
  >
    <section class="panel-card report-notice">
      <i class="pi pi-info-circle" />
      <div>
        <strong>Relatórios estão temporariamente indisponíveis.</strong>
        <p>
          Esta tela será conectada novamente quando o serviço de dados for reconstruído.
        </p>
      </div>
    </section>

    <ReportBuilder />
  </AppPageShell>
</template>

<style scoped>
.report-notice {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.report-notice i {
  color: var(--color-brand);
  font-size: 1.5rem;
}

.report-notice strong,
.report-notice p {
  margin: 0;
}

.report-notice p {
  margin-top: 0.4rem;
  color: var(--color-muted);
  line-height: 1.55;
}
</style>
