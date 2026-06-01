<template>
  <div class="apt-page">
    <PlaqueEntranceLoader
      :name="profile.name"
      :full-name="profile.fullName"
      :scene-ready="sceneReady"
    />

    <ApartmentScene
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
      <p v-if="sceneReady && !activeDoor" class="hud__hint">
        <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> se déplacer · Clic porte · <kbd>Échap</kbd> fermer
      </p>
    </header>

    <DoorInfoPanel
      :door-id="activeDoor"
      :doors="doors"
      :profile="profile"
      :projects="projects"
      :mobile-projects="mobileProjects"
      :skills="skills"
      :experiences="experiences"
      @close="closePanel"
    />
  </div>
</template>

<script setup lang="ts">
import ApartmentScene from '~/components/ApartmentScene.client.vue'
import DoorInfoPanel from '~/components/ui/DoorInfoPanel.vue'
import PlaqueEntranceLoader from '~/components/ui/PlaqueEntranceLoader.vue'

definePageMeta({ ssr: false })

const { profile, projects, mobileProjects, skills, experiences, doors } = usePortfolioData()

const sceneReady = ref(false)
const activeDoor = ref<string | null>(null)
const sceneRef = ref<{ closeAllDoors: (cb?: () => void) => void } | null>(null)

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
  window.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
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
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
  }
  .hud__hint {
    font-size: 0.68rem;
  }
}
</style>
