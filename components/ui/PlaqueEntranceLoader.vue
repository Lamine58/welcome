<template>
  <Transition name="plaque-fade">
    <div v-if="visible" class="plaque-loader" aria-live="polite">
      <div class="plaque-loader__stage">
        <div class="plaque-3d">
          <div class="plaque">
            <span class="plaque__screw plaque__screw--tl" aria-hidden="true" />
            <span class="plaque__screw plaque__screw--tr" aria-hidden="true" />
            <span class="plaque__screw plaque__screw--bl" aria-hidden="true" />
            <span class="plaque__screw plaque__screw--br" aria-hidden="true" />
            <p class="plaque__line">Bienvenue chez</p>
            <p class="plaque__name">{{ displayName }}</p>
          </div>
        </div>
      </div>

      <div class="plaque-loader__footer">
        <div class="plaque-loader__spinner" />
        <span class="plaque-loader__status">Ouverture de l'appartement…</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name: string
    fullName?: string
    sceneReady: boolean
  }>(),
  { fullName: '' },
)

const visible = ref(true)

const displayName = computed(() => props.name || props.fullName || 'Ishola')

watch(
  () => props.sceneReady,
  (ready) => {
    if (!ready) return
    setTimeout(() => {
      visible.value = false
    }, 400)
  },
)
</script>

<style scoped>
.plaque-loader {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: #1a1410;
  font-family: var(--font);
  pointer-events: none;
}

.plaque-loader__stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 900px;
  padding: 2rem 1.5rem 0;
}

.plaque-3d {
  transform: rotateX(14deg) rotateY(-6deg);
  transform-style: preserve-3d;
}

@media (prefers-reduced-motion: no-preference) {
  .plaque-3d {
    animation: plaque-float 3.5s ease-in-out infinite;
  }
}

@keyframes plaque-float {
  0%, 100% { transform: rotateX(14deg) rotateY(-6deg) translateY(0); }
  50% { transform: rotateX(12deg) rotateY(-4deg) translateY(-6px); }
}

.plaque {
  position: relative;
  min-width: min(320px, 88vw);
  padding: 1.35rem 2rem 1.5rem;
  text-align: center;
  background: linear-gradient(165deg, #faf8f4 0%, #ebe6dc 45%, #ddd6ca 100%);
  border: 3px solid #d8d0c4;
  border-radius: 6px;
  box-shadow:
    0 1px 0 #fff inset,
    0 -1px 0 rgba(0, 0, 0, 0.06) inset,
    0 18px 40px rgba(0, 0, 0, 0.45),
    0 4px 0 #b8aea0,
    0 28px 50px rgba(0, 0, 0, 0.25);
}

.plaque::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(139, 109, 75, 0.22);
  border-radius: 3px;
  pointer-events: none;
}

.plaque__screw {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #e8e4dc, #9a9080 70%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.plaque__screw--tl { top: 10px; left: 12px; }
.plaque__screw--tr { top: 10px; right: 12px; }
.plaque__screw--bl { bottom: 10px; left: 12px; }
.plaque__screw--br { bottom: 10px; right: 12px; }

.plaque__line {
  margin: 0 0 0.35rem;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #6b5a48;
}

.plaque__name {
  margin: 0;
  font-size: clamp(1.65rem, 5vw, 2.1rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #2c2419;
  line-height: 1.15;
}

.plaque-loader__footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding: 1.5rem 1rem 2.25rem;
}

.plaque-loader__spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(196, 165, 116, 0.22);
  border-top-color: #c4a574;
  border-radius: 50%;
  animation: plaque-spin 0.8s linear infinite;
}

.plaque-loader__status {
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  color: #a89884;
}

@keyframes plaque-spin {
  to {
    transform: rotate(360deg);
  }
}

.plaque-fade-leave-active {
  transition: opacity 0.5s ease;
}

.plaque-fade-leave-to {
  opacity: 0;
}
</style>
