<template>
  <Transition name="picker-fade">
    <div v-if="visible" class="universe-picker" role="dialog" aria-label="Choisir un univers">
      <div class="universe-picker__inner">
        <p class="universe-picker__eyebrow">Où allons-nous ?</p>
        <h2 class="universe-picker__title">Choisis ton univers</h2>

        <div class="universe-picker__grid">
          <button
            type="button"
            class="universe-card universe-card--apartment"
            @click="emit('select', 'apartment')"
          >
            <span class="universe-card__icon universe-card__icon--apartment" aria-hidden="true">
              <i class="bi bi-house" />
            </span>
            <span class="universe-card__label">Mon appart</span>
            <span class="universe-card__hint">Portfolio 3D · CV interactif</span>
          </button>

          <button
            type="button"
            class="universe-card universe-card--stadium"
            @click="emit('select', 'stadium')"
          >
            <span class="universe-card__icon universe-card__icon--stadium" aria-hidden="true">
              <i class="bi bi-trophy" />
            </span>
            <span class="universe-card__label">Mon stade</span>
            <span class="universe-card__hint">Terrain de foot · 3D</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()

const emit = defineEmits<{
  select: [universe: 'apartment' | 'stadium']
}>()
</script>

<style scoped>
.universe-picker {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(26, 20, 16, 0.72);
  backdrop-filter: blur(6px);
}

.universe-picker__inner {
  width: min(640px, 100%);
  padding: 2rem 1.75rem 1.75rem;
  text-align: center;
  background: linear-gradient(165deg, #faf8f4 0%, #ebe6dc 100%);
  border: 3px solid #d8d0c4;
  border-radius: 8px;
  box-shadow:
    0 1px 0 #fff inset,
    0 24px 48px rgba(0, 0, 0, 0.35);
}

.universe-picker__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8b7355;
}

.universe-picker__title {
  margin: 0 0 1.5rem;
  font-size: clamp(1.35rem, 4vw, 1.75rem);
  color: #2c2419;
}

.universe-picker__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.universe-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  padding: 1.35rem 1rem 1.2rem;
  border: 2px solid rgba(107, 90, 72, 0.18);
  border-radius: 8px;
  background: #fffaf5;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.universe-card:hover {
  transform: translateY(-3px);
  border-color: #c4a574;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.universe-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  font-size: 1.5rem;
  transition: transform 0.2s ease;
}

.universe-card:hover .universe-card__icon {
  transform: scale(1.05);
}

.universe-card__icon--apartment {
  color: #6b5a48;
  background: rgba(196, 165, 116, 0.2);
}

.universe-card__icon--stadium {
  color: #2d6a32;
  background: rgba(45, 106, 50, 0.12);
}

.universe-card__label {
  font-size: 1.05rem;
  font-weight: 700;
  color: #2c2419;
}

.universe-card__hint {
  font-size: 0.72rem;
  line-height: 1.35;
  color: #8b7355;
}

.picker-fade-enter-active,
.picker-fade-leave-active {
  transition: opacity 0.45s ease;
}

.picker-fade-enter-from,
.picker-fade-leave-to {
  opacity: 0;
}

@media (max-width: 540px) {
  .universe-picker__grid {
    grid-template-columns: 1fr;
  }
}
</style>
