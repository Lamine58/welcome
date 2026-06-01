<template>
  <div class="brand-logo" :class="{ 'brand-logo--sm': size === 'sm' }">
    <img
      v-if="!failed && src"
      :src="src"
      :alt="alt"
      loading="lazy"
      decoding="async"
      @error="failed = true"
    >
    <span v-else class="brand-logo__fallback">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string
    name: string
    alt?: string
    size?: 'sm' | 'md'
  }>(),
  { size: 'md', alt: '' },
)

const failed = ref(false)

watch(() => props.src, () => {
  failed.value = false
})

const initials = computed(() =>
  props.name
    .split(/[\s.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join(''),
)
</script>

<style scoped>
.brand-logo {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(107, 90, 72, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.brand-logo--sm {
  width: 48px;
  height: 48px;
  border-radius: 10px;
}

.brand-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.brand-logo__fallback {
  font-size: 0.95rem;
  font-weight: 700;
  color: #8b6d4b;
  letter-spacing: -0.02em;
}

.brand-logo--sm .brand-logo__fallback {
  font-size: 0.7rem;
}
</style>
