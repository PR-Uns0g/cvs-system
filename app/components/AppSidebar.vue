<script setup lang="ts">
import packageJson from "../../package.json";

const route = useRoute();
const isMenuOpen = ref(false);
const user = useState("session-user", () => ({
  name: "Representante Demo",
}));

const navigationItems = [
  {
    label: "Dashboard",
    description: "Veja os seus ganhos rápido",
    to: "/",
    icon: "pi pi-home",
  },
  {
    label: "Lançamentos",
    description: "Lance as suas notas no sistema",
    to: "/lancamentos",
    icon: "pi pi-receipt",
  },
  {
    label: "Contratantes",
    description: "Cadastre, edite e consulte",
    to: "/contratantes",
    icon: "pi pi-users",
  },
  {
    label: "Relatórios",
    description: "Gere um relatório",
    to: "/relatorios",
    icon: "pi pi-chart-bar",
  },
];

const appVersion = packageJson.version ?? "0.1.0";

const closeMenu = () => {
  isMenuOpen.value = false;
};

const isActiveRoute = (to: string) => {
  if (to === "/") {
    return route.path === "/";
  }

  return route.path.startsWith(to);
};
</script>

<template>
  <button
    type="button"
    class="app-sidebar-toggle"
    aria-label="Abrir menu principal"
    @click="isMenuOpen = !isMenuOpen"
  >
    <i class="pi pi-bars" />
  </button>

  <div v-if="isMenuOpen" class="app-sidebar-backdrop" @click="closeMenu" />

  <aside :class="['app-sidebar', { 'is-open': isMenuOpen }]">
    <div class="app-sidebar__surface">
      <NuxtLink to="/" class="app-brand" @click="closeMenu">
        <AppBrandMark />

        <div class="app-brand__copy">
          <strong>CVS System</strong>
          <small>Versão {{ appVersion }}</small>
        </div>
      </NuxtLink>

      <nav class="app-nav" aria-label="Navegação principal">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          :class="['app-nav__link', { 'is-active': isActiveRoute(item.to) }]"
          @click="closeMenu"
        >
          <span class="app-nav__icon">
            <i :class="item.icon" />
          </span>

          <span class="app-nav__copy">
            <strong>{{ item.label }}</strong>
            <small>{{ item.description }}</small>
          </span>
        </NuxtLink>
      </nav>

      <details class="app-user-menu">
        <summary class="app-user-trigger">
          <span class="app-user-trigger__avatar">
            <i class="pi pi-user" />
          </span>

          <span class="app-user-trigger__copy">
            <strong>{{ user.name }}</strong>
          </span>

          <i class="pi pi-chevron-up app-user-trigger__chevron" />
        </summary>

        <div class="app-user-menu__popover">
          <p class="app-user-menu__eyebrow">Sessão</p>

          <NuxtLink
            to="/login"
            class="app-user-menu__action"
            @click="closeMenu"
          >
            <i class="pi pi-sign-out" />
            <span>Logout</span>
          </NuxtLink>
        </div>
      </details>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 60;
  display: none;
  width: 3rem;
  height: 3rem;
  border: 0;
  border-radius: 1rem;
  background: rgba(16, 24, 17, 0.9);
  color: #fff;
  box-shadow: 0 18px 30px rgba(16, 24, 17, 0.18);
}

.app-sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(13, 22, 16, 0.48);
  backdrop-filter: blur(3px);
}

.app-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 1.5rem 0 1.5rem 1.5rem;
}

.app-sidebar__surface {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 2rem;
  border: 1px solid rgba(47, 122, 79, 0.1);
  border-radius: 2rem;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.96),
      rgba(244, 247, 241, 0.92)
    ),
    rgba(255, 255, 255, 0.8);
  box-shadow: 0 28px 60px rgba(21, 36, 24, 0.08);
  padding: 1.5rem;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-brand__copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.app-brand__copy strong {
  font-size: 1.05rem;
  line-height: 1.2;
}

.app-brand__copy small {
  width: fit-content;
  border-radius: 999px;
  background: rgba(47, 122, 79, 0.08);
  color: var(--color-brand-strong);
  font-size: 0.78rem;
  font-style: italic;
  line-height: 1.35;
  padding: 0.3rem 0.65rem;
}

.app-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.65rem;
}

.app-nav__link {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  border: 1px solid transparent;
  border-radius: 1.25rem;
  padding: 0.95rem 1rem;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.app-nav__link:hover {
  transform: translateX(2px);
  border-color: rgba(47, 122, 79, 0.12);
  background: rgba(47, 122, 79, 0.05);
}

.app-nav__link.is-active {
  border-color: rgba(47, 122, 79, 0.16);
  background: linear-gradient(
    180deg,
    rgba(47, 122, 79, 0.14),
    rgba(47, 122, 79, 0.06)
  );
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.app-nav__icon {
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 0.95rem;
  background: #fff;
  color: var(--color-brand);
  box-shadow: 0 8px 20px rgba(24, 48, 30, 0.08);
}

.app-nav__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.15rem;
}

.app-nav__copy strong {
  font-size: 0.97rem;
}

.app-nav__copy small {
  color: var(--color-muted);
  font-size: 0.78rem;
  line-height: 1.35;
}

.app-user-menu {
  position: relative;
  margin-top: auto;
}

.app-user-menu[open] .app-user-trigger__chevron {
  transform: rotate(180deg);
}

.app-user-trigger {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  list-style: none;
  cursor: pointer;
  border: 1px solid rgba(20, 32, 19, 0.08);
  border-radius: 1.4rem;
  background: rgba(255, 255, 255, 0.88);
  padding: 0.85rem 0.95rem;
}

.app-user-trigger::-webkit-details-marker {
  display: none;
}

.app-user-trigger__avatar {
  display: grid;
  width: 2.8rem;
  height: 2.8rem;
  place-items: center;
  border-radius: 1rem;
  background: linear-gradient(180deg, #152318, #203826);
  color: #fff;
}

.app-user-trigger__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.app-user-trigger__copy strong {
  font-size: 0.92rem;
}

.app-user-trigger__chevron {
  color: var(--color-muted);
  font-size: 0.82rem;
  transition: transform 0.2s ease;
}

.app-user-menu__popover {
  position: absolute;
  right: 0;
  bottom: calc(100% + 0.8rem);
  width: 100%;
  border: 1px solid rgba(47, 122, 79, 0.12);
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 24px 40px rgba(16, 24, 17, 0.12);
  padding: 0.9rem;
}

.app-user-menu__eyebrow {
  margin: 0 0 0.65rem;
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-user-menu__action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 1rem;
  padding: 0.85rem 0.9rem;
  color: var(--color-text);
  transition: background-color 0.2s ease;
}

.app-user-menu__action:hover {
  background: rgba(47, 122, 79, 0.06);
}

@media (max-width: 1100px) {
  .app-sidebar-toggle {
    display: grid;
    place-items: center;
  }

  .app-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 50;
    width: min(22rem, calc(100vw - 1.25rem));
    padding: 1rem;
    transform: translateX(-105%);
    transition: transform 0.28s ease;
  }

  .app-sidebar.is-open {
    transform: translateX(0);
  }

  .app-sidebar__surface {
    border-radius: 1.75rem;
  }
}
</style>
