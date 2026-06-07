import * as THREE from 'three'

export function createBlackScreenMaterial() {
  return new THREE.MeshBasicMaterial({
    color: 0x040406,
    fog: false,
    side: THREE.DoubleSide,
  })
}
