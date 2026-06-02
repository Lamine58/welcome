<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="doorId" class="overlay" @click.self="emit('close')">
        <div class="panel-stage">
          <div class="panel-3d">
            <article class="panel" role="dialog" :aria-label="title">
              <span class="panel__screw panel__screw--tl" aria-hidden="true" />
              <span class="panel__screw panel__screw--tr" aria-hidden="true" />
              <span class="panel__screw panel__screw--bl" aria-hidden="true" />
              <span class="panel__screw panel__screw--br" aria-hidden="true" />
              <button type="button" class="panel__close" aria-label="Fermer" @click="emit('close')">
                <i class="bi bi-x-lg" />
              </button>
              <div class="panel__content">
                <header class="panel__head">
            <div class="panel__icon-wrap">
              <i v-if="doorMeta" :class="`bi bi-${doorMeta.icon}`" />
            </div>
            <div>
              <p class="panel__room">{{ doorMeta?.label }}</p>
              <h2 class="panel__title">{{ title }}</h2>
            </div>
          </header>

          <div v-if="doorId === 'about'" class="panel__body panel__body--about">
            <div class="about-row">
              <img
                :src="profile.avatar"
                :alt="profile.fullName"
                class="about-photo"
                width="96"
                height="96"
                loading="eager"
              >
              <div>
                <p class="lead">{{ profile.fullName }}</p>
                <p class="muted">{{ profile.role }} · {{ profile.headline }}</p>
                <p class="muted">{{ profile.location }}</p>
              </div>
            </div>
            <p class="text about-bio">{{ profile.bio }}</p>
            <div class="about-lower">
              <div class="stats">
                <div><strong>7+</strong><span>Apps Play Store</span></div>
                <div><strong>15+</strong><span>Sites livrés</span></div>
                <div><strong>6+</strong><span>Ans d'exp.</span></div>
              </div>
              <div v-if="profile.languages?.length" class="lang-block">
                <h3><i class="bi bi-translate" /> Langues</h3>
                <p v-for="lang in profile.languages" :key="lang.name">
                  <strong>{{ lang.name }}</strong> — {{ lang.level }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="doorId === 'projects'" class="panel__body panel__body--grid">
            <ul class="list list--grid">
              <li v-for="p in projects" :key="p.id" class="list-item">
                <div class="list-item__content">
                  <strong>{{ p.title }}</strong>
                  <span class="tag">{{ p.subtitle }}</span>
                  <p>{{ p.description }}</p>
                  <div class="list-item__tags">
                    <span v-for="tag in p.tags" :key="tag">{{ tag }}</span>
                  </div>
                </div>
                <a :href="p.url" target="_blank" rel="noopener" class="link" :title="`Visiter ${p.title}`">
                  <i class="bi bi-box-arrow-up-right" />
                </a>
              </li>
            </ul>
          </div>

          <div v-else-if="doorId === 'mobile'" class="panel__body panel__body--grid">
            <ul class="list list--grid">
              <li v-for="app in mobileProjects" :key="app.id" class="list-item list-item--mobile">
                <BrandLogo :src="app.logo" :name="app.title" :alt="`Logo ${app.title}`" />
                <div class="list-item__content">
                  <strong>{{ app.title }}</strong>
                  <span class="tag">{{ app.client }}</span>
                  <p>{{ app.description }}</p>
                  <div class="list-item__tags">
                    <span v-for="tag in app.tags" :key="tag">{{ tag }}</span>
                  </div>
                  <div v-if="app.playStore || app.appStore" class="mobile-stores">
                    <a
                      v-if="app.playStore"
                      :href="app.playStore"
                      target="_blank"
                      rel="noopener"
                      class="mobile-stores__btn"
                    >
                      <i class="bi bi-google-play" /> Play Store
                    </a>
                    <a
                      v-if="app.appStore"
                      :href="app.appStore"
                      target="_blank"
                      rel="noopener"
                      class="mobile-stores__btn"
                    >
                      <i class="bi bi-apple" /> App Store
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div v-else-if="doorId === 'skills'" class="panel__body panel__body--grid">
            <div v-for="g in skills" :key="g.name" class="skill-block skill-block--cell">
              <h3><i class="bi bi-folder2" /> {{ g.name }}</h3>
              <div class="pills">
                <span v-for="item in g.items" :key="item">{{ item }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="doorId === 'experience'" class="panel__body panel__body--grid">
            <ul class="timeline timeline--grid">
              <li v-for="exp in experiences" :key="exp.id" class="timeline__row">
                <BrandLogo
                  :src="exp.logo"
                  :name="exp.company"
                  :alt="`Logo ${exp.company}`"
                />
                <div>
                  <strong>{{ exp.role }}</strong>
                  <span class="company">{{ exp.company }}</span>
                  <span class="period">{{ exp.period }}</span>
                  <p>{{ exp.description }}</p>
                </div>
              </li>
            </ul>
          </div>

          <div v-else-if="doorId === 'contact'" class="panel__body panel__body--grid contact-grid">
            <a :href="`mailto:${profile.email}`" class="contact-row">
              <i class="bi bi-envelope" />
              <div>
                <span class="contact-label">Email</span>
                <span class="contact-value">{{ profile.email }}</span>
              </div>
            </a>
            <a :href="`tel:${profile.phone.replace(/\s/g, '')}`" class="contact-row">
              <i class="bi bi-telephone" />
              <div>
                <span class="contact-label">Téléphone</span>
                <span class="contact-value">{{ profile.phone }}</span>
              </div>
            </a>
            <a :href="profile.linkedin" target="_blank" rel="noopener" class="contact-row">
              <i class="bi bi-linkedin" />
              <div>
                <span class="contact-label">LinkedIn</span>
                <span class="contact-value">Profil professionnel</span>
              </div>
            </a>
            <a :href="profile.github" target="_blank" rel="noopener" class="contact-row">
              <i class="bi bi-github" />
              <div>
                <span class="contact-label">GitHub</span>
                <span class="contact-value">@lamine58</span>
              </div>
            </a>
            <a :href="profile.facebook" target="_blank" rel="noopener" class="contact-row">
              <i class="bi bi-facebook" />
              <div>
                <span class="contact-label">Facebook</span>
                <span class="contact-value">ishola.hasrafidine</span>
              </div>
            </a>
            <a :href="profile.instagram" target="_blank" rel="noopener" class="contact-row">
              <i class="bi bi-instagram" />
              <div>
                <span class="contact-label">Instagram</span>
                <span class="contact-value">@isholalamine</span>
              </div>
            </a>
            <a :href="profile.tiktok" target="_blank" rel="noopener" class="contact-row">
              <i class="bi bi-tiktok" />
              <div>
                <span class="contact-label">TikTok</span>
                <span class="contact-value">@hasrafidine</span>
              </div>
            </a>
            <a :href="profile.portfolioMac" target="_blank" rel="noopener" class="contact-row">
              <i class="bi bi-laptop" />
              <div>
                <span class="contact-label">Autre CV</span>
                <span class="contact-value">Portfolio macOS</span>
              </div>
            </a>
          </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import BrandLogo from '~/components/ui/BrandLogo.vue'
import type { ApartmentDoor } from '~/composables/usePortfolioData'

const props = defineProps<{
  doorId: string | null
  doors: ApartmentDoor[]
  profile: ReturnType<typeof usePortfolioData>['profile']
  projects: ReturnType<typeof usePortfolioData>['projects']
  mobileProjects: ReturnType<typeof usePortfolioData>['mobileProjects']
  skills: ReturnType<typeof usePortfolioData>['skills']
  experiences: ReturnType<typeof usePortfolioData>['experiences']
}>()

const emit = defineEmits<{ close: [] }>()

const doorMeta = computed(() => props.doors.find((d) => d.id === props.doorId))

const titles: Record<string, string> = {
  about: 'Salon — Présentation',
  projects: 'Bureau — Réalisations web',
  mobile: 'Chambre — Apps mobile',
  skills: 'Atelier — Stack technique',
  experience: 'Couloir — Parcours pro',
  contact: 'Entrée — Me contacter',
}

const title = computed(() => (props.doorId ? titles[props.doorId] ?? '' : ''))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(10, 8, 6, 0.52);
}

.panel-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-height: 92vh;
}

.panel-3d {
  max-width: min(960px, 100%);
  width: 100%;
}

.panel {
  position: relative;
  width: 100%;
  max-height: min(88vh, 820px);
  overflow: hidden;
  padding: 2rem 2.25rem 2.1rem;
  border-radius: 6px;
  background: linear-gradient(165deg, #faf8f4 0%, #ebe6dc 45%, #ddd6ca 100%);
  color: #2c2419;
  border: 3px solid #d8d0c4;
  box-shadow:
    0 1px 0 #fff inset,
    0 -1px 0 rgba(0, 0, 0, 0.06) inset,
    0 22px 50px rgba(0, 0, 0, 0.5),
    0 5px 0 #b8aea0,
    0 32px 60px rgba(0, 0, 0, 0.28);
  --frame-top: 2rem;
  --frame-side: 2.25rem;
  --frame-bottom: 2.1rem;
}

.panel__screw {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #e8e4dc, #9a9080 70%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  z-index: 2;
}

.panel__screw--tl {
  top: calc(var(--frame-top) + 4px);
  left: calc(var(--frame-side) + 4px);
}

.panel__screw--tr {
  top: calc(var(--frame-top) + 4px);
  right: calc(var(--frame-side) + 4px);
}

.panel__screw--bl {
  top: auto;
  bottom: calc(var(--frame-bottom) + 4px);
  left: calc(var(--frame-side) + 4px);
}

.panel__screw--br {
  top: auto;
  bottom: calc(var(--frame-bottom) + 4px);
  right: calc(var(--frame-side) + 4px);
}

.panel__content {
  position: relative;
  z-index: 1;
  max-height: calc(min(88vh, 820px) - var(--frame-top) - var(--frame-bottom));
  overflow-y: auto;
  border: 1px solid rgba(139, 109, 75, 0.22);
  border-radius: 3px;
  padding: 1rem 1rem 1.1rem;
}

.panel__close {
  position: absolute;
  top: 0.7rem;
  right: 0.2rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #6b5a48;
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(107, 90, 72, 0.2);
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  z-index: 3;
}

.panel__close:hover {
  background: rgba(0, 0, 0, 0.12);
}

.panel__head {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  padding-right: 3rem;
  border-bottom: 1px solid rgba(107, 90, 72, 0.2);
}

.panel__icon-wrap {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 109, 75, 0.15);
  border-radius: 8px;
  font-size: 1.5rem;
  color: #6a5340;
}

.panel__room {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #8b6d4b;
  font-weight: 600;
}

.panel__title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.panel__body {
  font-size: 0.92rem;
  line-height: 1.65;
}

.panel__body--grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
  align-items: start;
}

@media (max-width: 720px) {
  .panel__body--grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .overlay {
    padding: 0.2rem;
  }

  .panel-stage,
  .panel-3d {
    max-width: 100%;
    width: 100%;
  }

  .panel {
    width: 100%;
    max-height: 94vh;
    border-width: 2px;
    border-radius: 10px;
    padding: 0.55rem;
    --frame-top: 0.75rem;
    --frame-side: 0.55rem;
    --frame-bottom: 0.75rem;
  }

  .panel__content {
    max-height: calc(94vh - var(--frame-top) - var(--frame-bottom));
    padding: 0.75rem 0.75rem 0.9rem;
    border-radius: 8px;
  }

  .panel__close {
    top: 1.45rem;
    right: 1.4rem;
    width: 32px;
    height: 32px;
  }

  .panel__head {
    gap: 0.65rem;
    margin-bottom: 0.85rem;
    padding-bottom: 0.7rem;
    padding-right: 2.35rem;
  }

  .panel__icon-wrap {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }

  .panel__title {
    font-size: 1.95rem;
    line-height: 1.14;
  }

  .panel__body {
    font-size: 0.95rem;
    line-height: 1.62;
  }

  .about-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.7rem;
  }

  .about-photo {
    width: 74px;
    height: 74px;
  }

  .list--grid .list-item,
  .timeline__row {
    padding: 0.75rem;
  }

  .list--grid .list-item--mobile {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 0.7rem 0.95rem;
    align-items: start;
  }

  .list--grid .list-item--mobile .list-item__content {
    padding-top: 0.1rem;
    padding-left: 8px;
  }

  .timeline__row {
    gap: 0.95rem;
  }

  .list-item p,
  .timeline p {
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .list-item__tags span {
    font-size: 0.7rem;
  }

  .mobile-stores {
    margin-top: 0.5rem;
    gap: 0.45rem;
  }

  .mobile-stores__btn {
    font-size: 0.72rem;
    padding: 0.35rem 0.62rem;
  }

  .contact-row {
    padding: 0.72rem 0.8rem;
  }
}

.lead { font-weight: 600; font-size: 1rem; }
.muted { color: #6b5a48; font-size: 0.85rem; }
.text { margin: 1rem 0; }

.about-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.about-photo {
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #c4a574;
}

.panel__body--about {
  max-width: 100%;
}

.about-bio {
  grid-column: 1 / -1;
}

.about-lower {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(107, 90, 72, 0.15);
}

@media (max-width: 720px) {
  .about-lower {
    grid-template-columns: 1fr;
  }
}

.about-lower .lang-block {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stats strong {
  display: block;
  font-size: 1.5rem;
  color: #8b6d4b;
}

.stats span { font-size: 0.75rem; color: #6b5a48; }

.edu-block,
.lang-block {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(107, 90, 72, 0.15);
}

.edu-block h3,
.lang-block h3 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8b6d4b;
  margin-bottom: 0.65rem;
}

.edu-block ul { list-style: none; }
.edu-block li { margin-bottom: 0.65rem; }
.edu-block li strong { display: block; font-size: 0.9rem; }
.edu-block li span { font-size: 0.8rem; color: #6b5a48; }
.lang-block p { font-size: 0.88rem; margin-bottom: 0.35rem; }

.list { list-style: none; }

.list--grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  grid-column: 1 / -1;
}

@media (max-width: 720px) {
  .list--grid {
    grid-template-columns: 1fr;
  }
}

.list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid rgba(107, 90, 72, 0.12);
}

.list--grid .list-item {
  padding: 1rem;
  margin: 0;
  border-bottom: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(107, 90, 72, 0.12);
  height: 100%;
}

.list--grid .list-item--mobile {
  flex-direction: row;
  align-items: flex-start;
}

.mobile-stores {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.65rem;
}

.mobile-stores__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #3d3228;
  background: rgba(252, 182, 69, 0.35);
  border: 1px solid rgba(139, 109, 75, 0.25);
  border-radius: 6px;
  transition: background 0.2s;
}

.mobile-stores__btn:hover {
  background: rgba(252, 182, 69, 0.55);
}

.mobile-stores__btn i {
  font-size: 0.95rem;
}

.list-item__content {
  flex: 1;
  min-width: 0;
}

.list-item strong { display: block; }

.list-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.list-item__tags span {
  font-size: 0.68rem;
  padding: 0.15rem 0.45rem;
  background: rgba(139, 109, 75, 0.1);
  border-radius: 4px;
  color: #6b5a48;
}
.tag { font-size: 0.75rem; color: #8b6d4b; font-weight: 600; }
.list-item p { font-size: 0.82rem; color: #5c4d3d; margin-top: 0.25rem; }

.link {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1rem;
  color: #6a5340;
  background: rgba(139, 109, 75, 0.1);
  align-self: center;
  transition: background 0.2s, color 0.2s;
}

.link:hover {
  background: rgba(139, 109, 75, 0.22);
  color: #3d3228;
}

.skill-block { margin-bottom: 0; }

.skill-block--cell {
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(107, 90, 72, 0.12);
}

.skill-block h3 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8b6d4b;
  margin-bottom: 0.5rem;
}

.pills { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.pills span {
  padding: 0.3rem 0.65rem;
  background: rgba(139, 109, 75, 0.12);
  border-radius: 4px;
  font-size: 0.8rem;
}

.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
}

.timeline--grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  grid-column: 1 / -1;
}

@media (max-width: 720px) {
  .timeline--grid {
    grid-template-columns: 1fr;
  }
}

.timeline li {
  list-style: none;
}

.timeline__row {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  margin: 0;
  border-bottom: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(107, 90, 72, 0.12);
  height: 100%;
}

.company { display: block; color: #8b6d4b; font-weight: 600; font-size: 0.88rem; }
.period { font-size: 0.75rem; color: #6b5a48; }
.timeline p { font-size: 0.85rem; color: #5c4d3d; margin-top: 0.35rem; }

.contact-grid.contact-grid {
  gap: 0.65rem 1rem;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  margin-bottom: 0;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 6px;
  border: 1px solid rgba(107, 90, 72, 0.15);
  transition: background 0.2s;
}

.contact-row i {
  font-size: 1.25rem;
  color: #8b6d4b;
  flex-shrink: 0;
}

.contact-row:hover { background: rgba(255, 255, 255, 0.8); }

.contact-label {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8b6d4b;
  margin-bottom: 0.1rem;
}

.contact-value {
  font-size: 0.9rem;
  font-weight: 500;
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.4s ease;
}

.panel-enter-active .panel-3d,
.panel-leave-active .panel-3d {
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-enter-from .panel-3d,
.panel-leave-to .panel-3d {
  transform: scale(0.82);
  opacity: 0;
}
</style>
