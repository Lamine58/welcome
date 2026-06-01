<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="project" class="modal-backdrop" @click.self="emit('close')">
        <article class="modal" role="dialog" aria-modal="true">
          <button type="button" class="modal__close" aria-label="Fermer" @click="emit('close')">
            ×
          </button>
          <div class="modal__glow" :style="{ background: project.color }" />
          <p class="modal__tag">{{ project.subtitle }}</p>
          <h2 class="modal__title">{{ project.title }}</h2>
          <p class="modal__desc">{{ project.description }}</p>
          <div class="modal__tags">
            <span v-for="tag in project.tags" :key="tag" class="modal__chip">{{ tag }}</span>
          </div>
          <a
            :href="project.url"
            target="_blank"
            rel="noopener noreferrer"
            class="modal__link"
          >
            Voir le projet →
          </a>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Project } from '~/composables/usePortfolioData'

defineProps<{
  project: Project | null
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(3, 0, 20, 0.7);
  backdrop-filter: blur(8px);
}

.modal {
  position: relative;
  max-width: 480px;
  width: 100%;
  padding: 2rem;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  overflow: hidden;
}

.modal__glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
  pointer-events: none;
}

.modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.05);
  transition: background 0.2s, color 0.2s;
}

.modal__close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
}

.modal__tag {
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 0.5rem;
}

.modal__title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

.modal__desc {
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.modal__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.modal__chip {
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-family: var(--mono);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
}

.modal__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--accent);
  transition: gap 0.2s;
}

.modal__link:hover {
  gap: 0.75rem;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9) translateY(20px);
}
</style>
