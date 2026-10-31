<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string
    detail: string
    icon?: string
    tone?: "default" | "success" | "highlight" | "warn" | "danger" | "dark"
  }>(),
  {
    icon: "pi pi-chart-line",
    tone: "default",
  },
);
</script>

<template>
  <article :class="['stat-card', `stat-card--${tone}`]">
    <div class="stat-card__icon">
      <i :class="icon" />
    </div>

    <div class="stat-card__body">
      <p>{{ label }}</p>
      <strong>{{ value }}</strong>
      <small>{{ detail }}</small>
    </div>
  </article>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid rgba(20, 32, 19, 0.07);
  border-radius: 1.6rem;
  background: #fff;
  box-shadow: 0 18px 35px rgba(21, 36, 24, 0.06);
  padding: 1.2rem;
}

.stat-card__icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 1rem;
  background: rgba(47, 122, 79, 0.1);
  color: var(--color-brand);
}

.stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-card__body p,
.stat-card__body strong,
.stat-card__body small {
  margin: 0;
}

.stat-card__body p {
  color: var(--color-muted);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.stat-card__body strong {
  font-size: 1.65rem;
  line-height: 1.05;
}

.stat-card__body small {
  color: var(--color-muted);
  font-size: 0.82rem;
  line-height: 1.45;
}

.stat-card--success {
  background: linear-gradient(
    180deg,
    rgba(237, 248, 240, 0.96),
    rgba(255, 255, 255, 1)
  );
}

.stat-card--highlight {
  background: linear-gradient(180deg, #152318, #203826);
  color: #fff;
}

.stat-card--highlight .stat-card__icon,
.stat-card--dark .stat-card__icon {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.stat-card--highlight .stat-card__body p,
.stat-card--highlight .stat-card__body small,
.stat-card--dark .stat-card__body p,
.stat-card--dark .stat-card__body small {
  color: rgba(255, 255, 255, 0.72);
}

.stat-card--warn {
  background: linear-gradient(
    180deg,
    rgba(255, 248, 234, 0.98),
    rgba(255, 255, 255, 1)
  );
}

.stat-card--warn .stat-card__icon {
  background: rgba(178, 111, 25, 0.14);
  color: #8e5a0d;
}

.stat-card--danger {
  background: linear-gradient(
    180deg,
    rgba(255, 239, 239, 0.98),
    rgba(255, 255, 255, 1)
  );
}

.stat-card--danger .stat-card__icon {
  background: rgba(187, 52, 52, 0.14);
  color: #ab3030;
}

.stat-card--dark {
  background: linear-gradient(180deg, #152318, #203826);
  color: #fff;
}
</style>
