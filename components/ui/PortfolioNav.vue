<template>
  <nav class="nav" :class="{ 'nav--scrolled': scrolled }">
    <a href="#hero" class="nav__logo" @click.prevent="emit('navigate', 'hero')">
      <span class="nav__logo-dot" />
      <span>Lamine<span class="nav__accent">.dev</span></span>
    </a>
    <ul class="nav__links">
      <li v-for="section in sections" :key="section.id">
        <button
          type="button"
          class="nav__link"
          :class="{ 'nav__link--active': activeSection === section.id }"
          @click="emit('navigate', section.id)"
        >
          {{ section.label }}
        </button>
      </li>
    </ul>
    <a
      :href="`mailto:${email}`"
      class="nav__cta"
    >
      Me contacter
    </a>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  sections: { id: string; label: string }[]
  activeSection: string
  email: string
  scrolled: boolean
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2.5rem;
  transition: background 0.4s, backdrop-filter 0.4s, border-color 0.4s;
  border-bottom: 1px solid transparent;
}

.nav--scrolled {
  background: rgba(3, 0, 20, 0.75);
  backdrop-filter: blur(16px);
  border-bottom-color: var(--border);
}

.nav__logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
}

.nav__logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--glow);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.15); }
}

.nav__accent {
  color: var(--accent);
}

.nav__links {
  display: flex;
  gap: 0.25rem;
  list-style: none;
}

.nav__link {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: var(--muted);
  border-radius: 999px;
  transition: color 0.2s, background 0.2s;
}

.nav__link:hover,
.nav__link--active {
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
}

.nav__link--active {
  color: var(--accent);
}

.nav__cta {
  padding: 0.55rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), #4cc9f0);
  color: var(--bg);
  transition: transform 0.2s, box-shadow 0.2s;
}

.nav__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--glow);
}

@media (max-width: 768px) {
  .nav {
    padding: 1rem 1.25rem;
  }
  .nav__links {
    display: none;
  }
}
</style>
