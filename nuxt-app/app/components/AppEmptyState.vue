<script setup lang="ts">
type EmptyStateVariant = "void" | "loading" | "search" | "report";

const props = withDefaults(
  defineProps<{
    icon: string;
    title: string;
    description?: string;
    variant?: EmptyStateVariant;
    stacked?: boolean;
    panel?: boolean;
    link?: {
      to: string;
      label: string;
    };
  }>(),
  {
    stacked: false,
    panel: false,
  },
);

const classes = computed(() => [
  "empty-state",
  props.variant && `empty-state--${props.variant}`,
  {
    "empty-state--stacked": props.stacked,
    "empty-state--panel": props.panel,
    "panel-card": props.panel,
  },
]);
</script>

<template>
  <component :is="props.panel ? 'section' : 'div'" :class="classes">
    <i :class="props.icon" />
    <div>
      <strong>{{ props.title }}</strong>
      <p v-if="props.description">{{ props.description }}</p>
      <NuxtLink v-if="props.link" :to="props.link.to" class="empty-state__link">
        {{ props.link.label }}
      </NuxtLink>
    </div>
  </component>
</template>

<style scoped>
.empty-state--panel {
  border: 1px dashed rgba(20, 32, 19, 0.12);
  background: rgba(247, 250, 247, 0.65);
}
</style>
