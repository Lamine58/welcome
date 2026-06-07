import * as THREE from 'three'
import { createBlackScreenMaterial } from '~/utils/apartmentDisplay'

export function applyMonitorWallpaper(
  screen: THREE.Mesh,
  texture: THREE.Texture,
  _lite = false,
) {
  texture.colorSpace = THREE.SRGBColorSpace

  if (screen.material) {
    screen.material.dispose()
  }

  screen.material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xffffff,
    toneMapped: true,
    fog: false,
    side: THREE.DoubleSide,
  })

  return screen.material
}

export function resetMonitorToBlack(screen: THREE.Mesh) {
  if (screen.material) {
    screen.material.dispose()
  }
  screen.material = createBlackScreenMaterial()
}
