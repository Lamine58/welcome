import * as THREE from 'three'

export function configureTexture(tex: THREE.Texture, renderer?: THREE.WebGLRenderer) {
  tex.colorSpace = THREE.SRGBColorSpace
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  if (renderer) {
    const max = renderer.capabilities.getMaxAnisotropy()
    tex.anisotropy = Math.min(4, max)
  }
}

export function disposeMaterial(material: THREE.Material) {
  for (const key of Object.keys(material)) {
    const value = (material as unknown as Record<string, unknown>)[key]
    if (value instanceof THREE.Texture) value.dispose()
  }
  material.dispose()
}

export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry?.dispose()
    const { material } = child
    if (Array.isArray(material)) material.forEach(disposeMaterial)
    else if (material) disposeMaterial(material)
  })
}
