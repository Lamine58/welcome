<template>
  <div class="apt-page">
    <PlaqueEntranceLoader
      :name="profile.name"
      :full-name="profile.fullName"
      :scene-ready="sceneReady"
    />

    <component
      :is="sceneComponent"
      ref="sceneRef"
      :doors="doors"
      :input-locked="!!activeDoor"
      @door-open="onDoorOpen"
      @ready="sceneReady = true"
    />

    <header class="hud" :class="{ 'hud--ready': sceneReady }">
      <div class="hud__brand">
        <img
          :src="profile.avatar"
          :alt="profile.name"
          class="hud__avatar"
          width="44"
          height="44"
        >
        <div>
          <strong>{{ profile.name }}</strong>
          <span>{{ profile.role }} · {{ profile.headline }}</span>
        </div>
      </div>
      <p v-if="sceneReady && !activeDoor && !isMobileUniverse" class="hud__hint">
        <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> se déplacer · Portes & objets cliquables · <kbd>Échap</kbd> fermer
      </p>
    </header>

    <DoorInfoPanel
      :door-id="activeDoor"
      :doors="doors"
      :profile="profile"
      :profile-quote="profileQuote"
      :projects="projects"
      :mobile-projects="mobileProjects"
      :skills="skills"
      :experiences="experiences"
      :board-tasks="boardTasks"
      @close="closePanel"
    />
  </div>
</template>

<script setup lang="ts">
import ApartmentScene from '~/components/ApartmentScene.client.vue'
import MobileSwipeScene from '~/components/MobileSwipeScene.client.vue'
import DoorInfoPanel from '~/components/ui/DoorInfoPanel.vue'
import PlaqueEntranceLoader from '~/components/ui/PlaqueEntranceLoader.vue'

definePageMeta({ ssr: false })

const { profile, projects, mobileProjects, skills, experiences, doors, boardTasks, profileQuote } = usePortfolioData()

const sceneReady = ref(false)
const activeDoor = ref<string | null>(null)
const sceneRef = ref<{ closeAllDoors: (cb?: () => void) => void } | null>(null)
const isMobileUniverse = ref(false)

const sceneComponent = computed(() => (
  isMobileUniverse.value ? MobileSwipeScene : ApartmentScene
))

function syncSceneMode() {
  const next = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
  if (next === isMobileUniverse.value) return
  isMobileUniverse.value = next
  sceneReady.value = false
  activeDoor.value = null
}

function onDoorOpen(id: string) {
  activeDoor.value = id
}

function closePanel() {
  activeDoor.value = null
  sceneRef.value?.closeAllDoors()
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && activeDoor.value) {
    e.preventDefault()
    closePanel()
  }
}

onMounted(() => {
  syncSceneMode()
  window.addEventListener('resize', syncSceneMode)
  window.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', syncSceneMode)
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<style scoped>
.apt-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #1a1410;
}

.hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-12px);
  transition: opacity 0.6s, transform 0.6s;
}

.hud--ready {
  opacity: 1;
  transform: none;
}

.hud__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: rgba(245, 235, 224, 0.92);
  border-radius: 4px;
  color: #2c2419;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.hud__avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #c4a574;
  box-shadow: 0 0 0 1px rgba(139, 109, 75, 0.35);
}

.hud__brand strong {
  display: block;
  font-size: 0.95rem;
}

.hud__brand span {
  font-size: 0.75rem;
  color: #6b5a48;
}

.hud__hint {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  font-size: 0.78rem;
  color: #f5ebe0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}

.hud__hint kbd {
  display: inline-block;
  min-width: 1.35rem;
  padding: 0.1rem 0.35rem;
  font-family: var(--mono);
  font-size: 0.7rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

@media (max-width: 640px) {
  .hud {
    display: flex;
    justify-content: center;
    padding: 0.6rem 0.7rem;
    top: 0.2rem;
    left: 0.2rem;
    right: 0.2rem;
    transform: none;
    opacity: 1;
    pointer-events: none;
  }

  .hud__brand {
    padding: 0.45rem 0.7rem;
    gap: 0.55rem;
    border-radius: 8px;
  }

  .hud__avatar {
    width: 32px;
    height: 32px;
  }

  .hud__brand strong {
    font-size: 0.82rem;
    line-height: 1.15;
  }

  .hud__brand span {
    font-size: 0.64rem;
  }

  .hud__hint { display: none; }
}
</style>
