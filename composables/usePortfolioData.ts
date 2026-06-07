export interface Project {
  id: string
  title: string
  subtitle: string
  description: string
  url: string
  tags: string[]
  color: string
  orbitAngle: number
}

export interface MobileProject {
  id: string
  title: string
  client: string
  description: string
  logo: string
  tags: string[]
  playStore?: string
  appStore?: string
}

export interface Experience {
  id: string
  role: string
  company: string
  period: string
  description: string
  logo?: string
  website?: string
}

export interface Education {
  degree: string
  school: string
  year: string
}

import { publicAsset } from '~/utils/publicAsset'

/** Logo haute résolution via favicon Google (domaine du site) */
export function logoFromUrl(url: string, size = 128): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return `https://www.google.com/s2/favicons?domain=${host}&sz=${size}`
  } catch {
    return ''
  }
}

const LOCAL_LOGOS: Record<string, string> = {
  xpaye: 'logos/xpaye.jpg',
  setbc: 'logos/setbc.svg',
  sisrah: 'logos/sisrah.svg',
  clinic: 'logos/clinic.png',
  jedonne: 'logos/jedonne.svg',
  rsm: 'logos/rsm.svg',
  mysoft: 'logos/mysoft.svg',
  enistrophe: 'logos/enistrophe.png',
  sdsi: 'logos/sdsi.jpg',
  paiementpro: 'logos/paiementpro.png',
  ict4dev: 'logos/ict4dev.png',
  synelia: 'logos/synelia.png',
  icdigital: 'logos/icdigital.png',
  smahiley: 'logos/smahiley.jpeg',
}

function resolveLogo(id: string, url: string): string {
  const local = LOCAL_LOGOS[id]
  return local ? publicAsset(local) : logoFromUrl(url)
}

export interface SkillGroup {
  name: string
  items: string[]
}

export interface ApartmentDoor {
  id: string
  label: string
  icon: string
  wall: 'north' | 'south' | 'east' | 'west'
  color: string
}

export interface BoardTask {
  text: string
  color: string
  done?: boolean
  x: number
  y: number
  w: number
  h: number
  rot?: number
}

export interface ApartmentHotspot {
  id: string
  panelId: string
  label: string
  icon: string
  hint: string
}

export function usePortfolioData() {
  const profile = {
    name: 'Lamine Ishola',
    fullName: 'Hasrafidine Abdel-Lamine Ishola',
    role: 'Développeur Fullstack',
    headline: 'Expert Web & Mobile',
    tagline: 'Paiement · Traçabilité · APIs critiques',
    bio: `Expert Fullstack spécialisé dans les infrastructures critiques (Paiement, Traçabilité). J'ai conçu et publié 7 applications professionnelles sur le Play Store, maîtrisant l'architecture API REST complexe et le déploiement multi-plateforme haute performance. Mon approche combine une rigueur technique backend (Laravel, NestJS) avec une exigence de fluidité mobile (Flutter, Ionic).`,
    email: 'isholalamine41@gmail.com',
    phone: '+225 01 72 56 01 15',
    location: 'Abidjan, Côte d\'Ivoire',
    linkedin: 'https://linkedin.com/in/hasrafidine-abdel-l-ishola-0121a7192',
    github: 'https://github.com/lamine58',
    facebook: 'https://www.facebook.com/ishola.hasrafidine',
    instagram: 'https://www.instagram.com/isholalamine/',
    tiktok: 'https://www.tiktok.com/@hasrafidine',
    portfolioMac: 'https://lamine58.github.io/mac-os/home',
    languages: [
      { name: 'Français', level: 'Langue maternelle' },
      { name: 'Anglais', level: 'Professionnel' },
    ],
    avatar: publicAsset('avatar.jpg'),
  }

  const projects: Project[] = [
    {
      id: 'xpaye',
      title: 'XPAYE',
      subtitle: 'Infrastructure de Paiement Régionale',
      description:
        'Système d\'interopérabilité et services de paiement multi-pays pour faciliter les transactions financières transfrontalières.',
      url: 'https://xpaye.africa',
      tags: ['NestJS', 'Flutter', 'API REST'],
      color: '#00f5d4',
      orbitAngle: 0,
    },
    {
      id: 'setbc',
      title: 'SETBC',
      subtitle: 'Conseil du Café-Cacao',
      description:
        'Mise en place du système d\'enregistrement des transactions bord champs pour assurer la traçabilité complète et sécurisée du cacao ivoirien.',
      url: 'https://setbc.ci',
      tags: ['Laravel', 'Vue.js', 'Mobile'],
      color: '#7b2ff7',
      orbitAngle: Math.PI * 0.4,
    },
    {
      id: 'sisrah',
      title: 'SISRAH',
      subtitle: 'Ministère des Ressources Animales',
      description:
        'Solution mobile de collecte de données terrain pour digitaliser et analyser les activités des exploitants halieutiques.',
      url: 'https://play.google.com/store/apps/details?id=com.sisrah.sisrah',
      tags: ['Flutter', 'Offline-first'],
      color: '#ff6b6b',
      orbitAngle: Math.PI * 0.8,
    },
    {
      id: 'clinic',
      title: 'Clinic du Web',
      subtitle: 'Services Digitaux',
      description:
        'Accompagnement digital complet : développement web/mobile sur mesure, design UI/UX et stratégie de croissance digitale.',
      url: 'https://clinicduweb.online',
      tags: ['Nuxt', 'Laravel', 'UI/UX'],
      color: '#ffd93d',
      orbitAngle: Math.PI * 1.2,
    },
    {
      id: 'paiementpro',
      title: 'Paiement PRO',
      subtitle: 'Passerelle de paiement',
      description:
        'Pilotage de la passerelle de paiement, intégrations marchandes et APIs Fintech haute disponibilité.',
      url: 'https://paiementpro.net',
      tags: ['Fintech', 'API', 'Support'],
      color: '#20c997',
      orbitAngle: Math.PI * 1.6,
    },
    {
      id: 'jedonne',
      title: 'Je Donne.ci',
      subtitle: 'Plateforme solidaire',
      description: 'Application de dons et solidarité communautaire en Côte d\'Ivoire.',
      url: 'https://jedonne.ci',
      tags: ['Vue.js', 'Laravel'],
      color: '#4cc9f0',
      orbitAngle: Math.PI * 2,
    },
    {
      id: 'rsm',
      title: 'RSM-CI',
      subtitle: 'Gestion & reporting',
      description: 'Solution web de gestion et reporting pour organisations.',
      url: 'https://rsm-ci.net',
      tags: ['Fullstack', 'Laravel'],
      color: '#f72585',
      orbitAngle: Math.PI * 2.4,
    },
    {
      id: 'mysoft',
      title: 'MySoft-C',
      subtitle: 'Solutions logicielles',
      description: 'Plateforme et outils métiers pour entreprises.',
      url: 'https://mysoft-c.com',
      tags: ['Laravel', 'Web'],
      color: '#5c7cfa',
      orbitAngle: Math.PI * 2.8,
    },
  ]

  const skills: SkillGroup[] = [
    {
      name: 'Expertise Mobile',
      items: ['Flutter', 'Dart', 'Ionic', 'Angular', 'Capacitor', 'Cordova', 'Firebase'],
    },
    {
      name: 'Web & Backend',
      items: ['React.js', 'Next.js', 'NestJS', 'Laravel', 'Nuxt.js', 'Vue.js', 'Django', 'Node.js', 'TypeScript', 'API REST'],
    },
    {
      name: 'Bases de données',
      items: ['PostgreSQL', 'MySQL', 'SQL Server', 'SQL'],
    },
    {
      name: 'Versioning & Outils',
      items: ['Git / GitHub', 'Docker', 'Postman', 'CI/CD'],
    },
  ]

  const experiences: Experience[] = [
    {
      id: 'synelia',
      role: 'Développeur back-end',
      company: 'SYNELIA GROUP',
      period: '2026 — Présent',
      description: 'Développement backend avec NestJS et APIs REST pour solutions d\'entreprise.',
      logo: resolveLogo('synelia', 'https://synelia.com'),
      website: 'https://synelia.com',
    },
    {
      id: 'xpaye',
      role: 'Développeur Full Stack · Ingénieur support',
      company: 'XPAYE',
      period: '2025 — Présent',
      description:
        'Infrastructure de paiement régionale. Maintenance, intégrations et développement full stack (NestJS).',
      logo: resolveLogo('xpaye', 'https://xpaye.africa'),
      website: 'https://xpaye.africa',
    },
    {
      id: 'icdigital',
      role: 'Consultant Web & Mobile',
      company: 'IC DIGITAL TRANS',
      period: '2023 — 2025',
      description:
        'Accompagnement sur projets de transformation digitale nationale. Architectures évolutives, audit de code et optimisation des flux de données critiques.',
      logo: resolveLogo('icdigital', 'https://ic-digitaltrans.com'),
    },
    {
      id: 'paiementpro',
      role: 'Responsable technique · Ingénieur support',
      company: 'Paiement PRO',
      period: '2022 — 2026',
      description:
        'Pilotage de la passerelle de paiement. Supervision des intégrations marchandes, maintenance des APIs et disponibilité système Fintech.',
      logo: resolveLogo('paiementpro', 'https://paiementpro.net'),
      website: 'https://paiementpro.net',
    },
    {
      id: 'smahiley',
      role: 'Consultant',
      company: 'SMAHILEY',
      period: '2022 — 2025',
      description: 'Développement mobile Flutter et applications hybrides Ionic.',
      logo: resolveLogo('smahiley', 'https://smahiley.com'),
    },
    {
      id: 'ict4dev',
      role: 'Développeur Web & Mobile',
      company: 'ICT4DEV Côte d\'Ivoire',
      period: '2021 — 2025',
      description:
        'Outils digitaux innovants. Interfaces Flutter et systèmes de gestion de bases de données pour la collecte de données.',
      logo: resolveLogo('ict4dev', 'https://ict4dev.org'),
      website: 'https://ict4dev.org',
    },
    {
      id: 'clinic',
      role: 'Développeur Full Stack',
      company: 'ClinicDuWeb',
      period: '2020 — Présent',
      description:
        'Solutions web et mobiles pour PME. Projets fullstack du design à la mise en ligne, SEO et accompagnement digital.',
      logo: resolveLogo('clinic', 'https://clinicduweb.online'),
      website: 'https://clinicduweb.online',
    },
    {
      id: 'enistrophe',
      role: 'Développeur Web & Mobile',
      company: 'Enistrophe Côte d\'Ivoire',
      period: '2020 — 2022',
      description: 'Applications web et mobiles Laravel, WordPress et solutions sur mesure.',
      logo: resolveLogo('enistrophe', 'https://enistrophe.com'),
      website: 'https://enistrophe.com',
    },
    {
      id: 'sdsi',
      role: 'Développeur PHP',
      company: 'SDSI',
      period: '2018 — 2020',
      description: 'Applications d\'entreprise PHP, framework Ionic et développement en équipe.',
      logo: resolveLogo('sdsi', 'https://sdsi.ci'),
      website: 'https://sdsi.ci',
    },
  ]

  const education: Education[] = [
    { degree: 'Master Génie Logiciel', school: 'HETEC Abidjan', year: '2020' },
    { degree: 'Licence Informatique Décisionnelle', school: 'HETEC Abidjan', year: '2018' },
  ]

  const mobileLogos: Record<string, string> = {
    muscopci: publicAsset('logos/mobile/muscopci.webp'),
    sisrah: publicAsset('logos/mobile/sisrah.webp'),
    babylearn: publicAsset('logos/mobile/babylearn.webp'),
    santeplus: publicAsset('logos/mobile/santeplus.jpg'),
    biosave: publicAsset('logos/mobile/biosave.png'),
    trustworld: publicAsset('logos/mobile/trustworld.webp'),
    diagmedical: publicAsset('logos/mobile/diagmedical.png'),
    straphael: publicAsset('logos/mobile/straphael.webp'),
    karite: publicAsset('logos/mobile/karite.png'),
    logistiquemedical: publicAsset('logos/mobile/logistiquemedical.png'),
  }

  const mobileProjects: MobileProject[] = [
    {
      id: 'muscopci',
      title: 'MUSCOP-CI',
      client: 'Mutuelle Sociale des membres du corps préfectoral',
      logo: mobileLogos.muscopci!,
      description:
        'Application pour suivre l\'actualité, les activités, les projets et les informations sur l\'assurance maladie des membres.',
      tags: ['Flutter', 'API PHP', 'OneSignal', 'UX/UI'],
      playStore: 'https://play.google.com/store/apps/details?id=com.icdigitaltrans.muscopci',
      appStore: 'https://apps.apple.com/us/app/muscop-ci/id6451344800',
    },
    {
      id: 'sisrah',
      title: 'SISRAH',
      client: 'Ministère des Ressources Animales et Halieutiques',
      logo: mobileLogos.sisrah!,
      description:
        'Collecte de données terrain pour les exploitants halieutiques : saisie, centralisation et analyse des activités.',
      tags: ['Flutter', 'Laravel API', 'OneSignal', 'Offline-first'],
      playStore: 'https://play.google.com/store/apps/details?id=com.sisrah.sisrah',
    },
    {
      id: 'babylearn',
      title: 'BabyLearn',
      client: 'BabyLearn',
      logo: mobileLogos.babylearn!,
      description:
        'Application éducative ludique : leçons interactives, défis et activités de traçage pour apprendre à lire, écrire et compter.',
      tags: ['Flutter', 'Laravel API', 'UX/UI'],
      playStore: 'https://play.google.com/store/apps/details?id=com.cdw.babylearn',
      appStore: 'https://apps.apple.com/us/app/babylearn-app/id6754986579',
    },
    {
      id: 'santeplus',
      title: 'Santé+',
      client: 'AMIRA GLOBAL TECHNOLOGIES',
      logo: mobileLogos.santeplus!,
      description:
        'Prix des médicaments, pharmacies de garde et médecins disponibles à proximité, avec informations de santé en temps réel.',
      tags: ['Flutter', 'API PHP', 'OneSignal', 'UX/UI'],
      playStore: 'https://play.google.com/store/apps/details?id=com.cdw.sante',
      appStore: 'https://apps.apple.com/us/app/sant%C3%A9/id6743252600',
    },
    {
      id: 'biosave',
      title: 'Biosave',
      client: 'Biosave CI',
      logo: mobileLogos.biosave!,
      description:
        'Tutoriels pour créer des engrais et insecticides biologiques à partir de produits naturels, pour l\'agriculture durable.',
      tags: ['Ionic', 'API PHP'],
      playStore: 'https://play.google.com/store/apps/details?id=com.biosave.cdw',
    },
    {
      id: 'trustworld',
      title: 'Trust World',
      client: 'TRUST WORLD',
      logo: mobileLogos.trustworld!,
      description:
        'Plateforme sécurisée reliant acheteurs et vendeurs pour découvrir, échanger et valoriser des articles de valeur.',
      tags: ['Flutter', 'Laravel API', 'OneSignal', 'UX/UI'],
      playStore: 'https://play.google.com/store/apps/details?id=com.trustworld.cdw',
    },
    {
      id: 'diagmedical',
      title: 'Diag Medical+',
      client: 'ANEPAM',
      logo: mobileLogos.diagmedical!,
      description:
        'Centralisation des données de santé, localisation des centres médicaux et gestion des examens médicaux.',
      tags: ['Flutter', 'Laravel API', 'UX/UI'],
      playStore: 'https://play.google.com/store/apps/details?id=app.anepam.diagmedics',
    },
    {
      id: 'straphael',
      title: 'App St Raphaël',
      client: 'Mutuelle Saint Raphaël',
      logo: mobileLogos.straphael!,
      description:
        'Actualité, activités, informations santé et répertoire complet des membres de la mutuelle.',
      tags: ['Flutter', 'API PHP', 'OneSignal', 'UX/UI'],
      playStore: 'https://play.google.com/store/apps/details?id=com.icdigitaltrans.st_raphael',
    },
    {
      id: 'karite',
      title: 'Karité 2.0 Store',
      client: 'ICT4DEV',
      logo: mobileLogos.karite!,
      description:
        'Commande et paiement de beurre de karité depuis le monde entier, suivi des commandes et traçabilité via QR code.',
      tags: ['Flutter', 'Laravel API', 'Mobile Money', 'UX/UI'],
    },
    {
      id: 'logistiquemedical',
      title: 'Logistique Medical CI',
      client: 'Logistique Medical CI',
      logo: mobileLogos.logistiquemedical!,
      description:
        'Gestion des factures pro forma et des ventes, avec suivi clair de l\'activité commerciale pour les professionnels.',
      tags: ['Flutter', 'Laravel API', 'UX/UI'],
    },
  ]

  const doors: ApartmentDoor[] = [
    { id: 'about', label: 'Qui suis-je ?', icon: 'person-badge', wall: 'west', color: '#c4a574' },
    { id: 'projects', label: 'Mes projets', icon: 'rocket-takeoff', wall: 'east', color: '#7eb8a4' },
    { id: 'mobile', label: 'Apps mobile', icon: 'phone', wall: 'west', color: '#fcb645' },
    { id: 'skills', label: 'Compétences', icon: 'lightning-charge', wall: 'north', color: '#9b8ec4' },
    { id: 'experience', label: 'Parcours', icon: 'briefcase', wall: 'north', color: '#d4846a' },
    { id: 'contact', label: 'Contact', icon: 'envelope', wall: 'south', color: '#6a9fd4' },
  ]

  const boardTasks: BoardTask[] = [
    { text: 'APIs Laravel / NestJS', color: '#fff9a8', done: true, x: 108, y: 14, w: 148, h: 88, rot: -0.04 },
    { text: 'Apps Flutter · Play Store', color: '#ffd4a8', done: true, x: 278, y: 28, w: 152, h: 86, rot: 0.05 },
    { text: 'Passerelle paiement', color: '#a8e6cf', done: false, x: 452, y: 18, w: 138, h: 92, rot: -0.07 },
    { text: 'Portfolio 3D interactif', color: '#ffc8dd', done: false, x: 92, y: 118, w: 158, h: 96, rot: 0.04 },
    { text: 'Traçabilité QR', color: '#bde0fe', done: true, x: 278, y: 132, w: 146, h: 94, rot: -0.03 },
    { text: 'Support marchands', color: '#e2f0cb', done: false, x: 448, y: 128, w: 142, h: 98, rot: 0.06 },
    { text: 'Mobile Money CI', color: '#f9dcc4', done: true, x: 168, y: 248, w: 154, h: 90, rot: -0.05 },
    { text: 'Audit & perf API', color: '#d4c4fb', done: false, x: 352, y: 258, w: 148, h: 88, rot: 0.04 },
  ]

  const hotspots: ApartmentHotspot[] = [
    { id: 'tv', panelId: 'projects', label: 'Télé — Himra', icon: 'tv', hint: 'Cliquer pour lire / pause' },
    { id: 'monitor', panelId: 'projects', label: 'Écran — Projets', icon: 'display', hint: 'Projets en cours' },
    { id: 'books', panelId: 'skills', label: 'Bibliothèque', icon: 'book', hint: 'Stack technique' },
    { id: 'clock', panelId: 'clock', label: 'Horloge', icon: 'clock', hint: 'Heure & disponibilité' },
    { id: 'table', panelId: 'links', label: 'Table basse', icon: 'link-45deg', hint: 'Liens utiles' },
    { id: 'trophy', panelId: 'stats', label: 'Trophées', icon: 'trophy', hint: 'Chiffres clés' },
    { id: 'window', panelId: 'tasks', label: 'Tableau — Tâches', icon: 'kanban', hint: 'Mes priorités' },
  ]

  const profileQuote =
    '« Construire des systèmes fiables — paiement, traçabilité, mobile — avec la même exigence du backend au pixel. »'

  return { profile, projects, mobileProjects, skills, experiences, education, doors, hotspots, boardTasks, profileQuote }
}
