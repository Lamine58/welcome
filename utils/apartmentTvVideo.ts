import * as THREE from 'three'
import { createBlackScreenMaterial } from '~/utils/apartmentDisplay'

export interface TvVideoHandle {
  togglePlayPause: () => Promise<void>
  isPlaying: () => boolean
  update: () => void
  dispose: () => void
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

  const showBlack = () => {
    if (screen.material !== blackMaterial) {
      screen.material = blackMaterial
    }
  }

  const showVideo = () => {
    screen.material = videoMaterial
    refresh()
  }

  return {
    async togglePlayPause() {
      if (video.paused) {
        video.muted = false
        video.volume = 0.85
        await video.play()
        showVideo()
      } else {
        video.pause()
        showBlack()
      }
    },
    isPlaying: () => !video.paused && !video.ended,
    update: refresh,
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
