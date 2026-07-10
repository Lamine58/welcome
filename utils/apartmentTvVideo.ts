import * as THREE from 'three'
import { createBlackScreenMaterial } from '~/utils/apartmentDisplay'

export interface TvVideoHandle {
  play: () => Promise<void>
  togglePlayPause: () => Promise<void>
  isPlaying: () => boolean
  update: (camera?: THREE.Camera, renderer?: THREE.WebGLRenderer) => void
  dispose: () => void
}

export const TV_YOUTUBE_URL = 'https://www.youtube.com/watch?v=fcnDmrtj6Sk&list=RDfcnDmrtj6Sk&start_radio=1'

export function parseYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0]
      return id || null
    }
    return parsed.searchParams.get('v')
  } catch {
    return null
  }
}

function projectScreenOverlay(
  screen: THREE.Mesh,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  overlay: HTMLElement,
) {
  const geo = screen.geometry as THREE.PlaneGeometry
  const hw = (geo.parameters.width ?? 1.5) / 2
  const hh = (geo.parameters.height ?? 0.85) / 2
  const corners = [
    new THREE.Vector3(-hw, hh, 0),
    new THREE.Vector3(hw, hh, 0),
    new THREE.Vector3(-hw, -hh, 0),
    new THREE.Vector3(hw, -hh, 0),
  ]

  const canvasRect = renderer.domElement.getBoundingClientRect()
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let visible = true

  for (const local of corners) {
    const world = local.clone().applyMatrix4(screen.matrixWorld)
    const projected = world.project(camera)
    if (projected.z < -1 || projected.z > 1) visible = false
    const sx = canvasRect.left + (projected.x * 0.5 + 0.5) * canvasRect.width
    const sy = canvasRect.top + (-projected.y * 0.5 + 0.5) * canvasRect.height
    minX = Math.min(minX, sx)
    maxX = Math.max(maxX, sx)
    minY = Math.min(minY, sy)
    maxY = Math.max(maxY, sy)
  }

  const width = Math.max(0, maxX - minX)
  const height = Math.max(0, maxY - minY)
  if (!visible || width < 8 || height < 8) {
    overlay.style.display = 'none'
    return
  }

  overlay.style.display = 'block'
  overlay.style.left = `${minX}px`
  overlay.style.top = `${minY}px`
  overlay.style.width = `${width}px`
  overlay.style.height = `${height}px`
}

export function setupTvYoutube(
  screen: THREE.Mesh,
  youtubeUrl: string,
): TvVideoHandle | null {
  const videoId = parseYoutubeId(youtubeUrl)
  if (!videoId) return null

  const blackMaterial = createBlackScreenMaterial()
  screen.material = blackMaterial

  const wrapper = document.createElement('div')
  Object.assign(wrapper.style, {
    position: 'fixed',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: '5',
    display: 'none',
    background: '#000',
  })

  const iframe = document.createElement('iframe')
  iframe.title = 'Lecture TV'
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture'
  iframe.setAttribute('allowfullscreen', 'true')
  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
  })
  wrapper.appendChild(iframe)
  document.body.appendChild(wrapper)

  let playing = false

  const embedSrc = (autoplay: boolean) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=0&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${videoId}`

  async function startPlayback() {
    iframe.src = embedSrc(true)
    wrapper.style.display = 'block'
    playing = true
  }

  return {
    async play() {
      if (playing) return
      try {
        await startPlayback()
      } catch {
        /* autoplay bloqué */
      }
    },
    async togglePlayPause() {
      if (playing) {
        iframe.src = 'about:blank'
        wrapper.style.display = 'none'
        playing = false
      } else {
        await startPlayback()
      }
    },
    isPlaying: () => playing,
    update(camera, renderer) {
      if (!playing || !camera || !renderer) return
      projectScreenOverlay(screen, camera, renderer, wrapper)
    },
    dispose() {
      iframe.src = 'about:blank'
      wrapper.remove()
      blackMaterial.dispose()
    },
  }
}

export function setupTvVideo(
  screen: THREE.Mesh,
  src: string,
  _renderer?: THREE.WebGLRenderer,
  _lite = false,
): TvVideoHandle {
  const video = document.createElement('video')
  video.src = src
  video.loop = true
  video.muted = false
  video.volume = 0.85
  video.playsInline = true
  video.preload = 'auto'
  video.setAttribute('playsinline', 'true')
  video.setAttribute('webkit-playsinline', 'true')
  Object.assign(video.style, {
    position: 'fixed',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-1',
    top: '0',
    left: '0',
  })
  document.body.appendChild(video)

  const texture = new THREE.VideoTexture(video)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter

  const blackMaterial = createBlackScreenMaterial()
  const videoMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xffffff,
    toneMapped: true,
    fog: false,
    side: THREE.DoubleSide,
  })

  screen.material = blackMaterial

  const refresh = () => {
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      texture.needsUpdate = true
    }
  }

  video.addEventListener('loadeddata', refresh)
  video.addEventListener('canplay', refresh)

  const showVideo = () => {
    screen.material = videoMaterial
    refresh()
  }

  async function startPlayback(unmuted = true) {
    video.muted = !unmuted
    if (unmuted) video.volume = 0.85
    await video.play()
    showVideo()
  }

  return {
    async play() {
      if (!video.paused) return
      try {
        await startPlayback(true)
      } catch {
        try {
          await startPlayback(false)
        } catch {
          /* autoplay bloqué par le navigateur */
        }
      }
    },
    async togglePlayPause() {
      if (video.paused) {
        await startPlayback(true)
      } else {
        video.pause()
        refresh()
      }
    },
    isPlaying: () => !video.paused && !video.ended,
    update() {
      refresh()
    },
    dispose() {
      video.pause()
      video.removeAttribute('src')
      video.load()
      video.remove()
      texture.dispose()
      videoMaterial.dispose()
      blackMaterial.dispose()
    },
  }
}
