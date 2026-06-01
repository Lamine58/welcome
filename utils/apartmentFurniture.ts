import * as THREE from 'three'

type Mat = THREE.MeshStandardMaterial

function mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...opts })
}

function box(
  w: number,
  h: number,
  d: number,
  material: Mat,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  castShadow = true,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  m.position.set(x, y, z)
  m.castShadow = castShadow
  m.receiveShadow = true
  parent.add(m)
  return m
}

export function buildDetailedFurniture(scene: THREE.Scene) {
  const root = new THREE.Group()
  scene.add(root)

  const wood = mat(0x6b4423)
  const woodDark = mat(0x4a3728)
  const fabric = mat(0x3d4f5f)
  const fabricDark = mat(0x2d3a47)
  const fabricLight = mat(0x5a6b7d)
  const white = mat(0xf5f0e8)
  const metal = mat(0x888888, { metalness: 0.7, roughness: 0.3 })
  const bookColors = [0x8b4513, 0x2d5a27, 0x4a3728, 0x6b3a3a, 0x3d5a80]

  // —— Canapé détaillé ——
  const sofa = new THREE.Group()
  sofa.position.set(-2.8, 0, 2.8)
  root.add(sofa)
  box(3, 0.42, 1.05, fabric, 0, 0.21, 0, sofa)
  box(3, 0.65, 0.32, fabric, 0, 0.55, 0.52, sofa)
  box(0.28, 0.55, 1.05, fabricDark, -1.45, 0.48, 0, sofa)
  box(0.28, 0.55, 1.05, fabricDark, 1.45, 0.48, 0, sofa)
  box(0.55, 0.18, 0.85, fabricLight, -0.9, 0.52, 0.05, sofa)
  box(0.55, 0.18, 0.85, fabricLight, 0.5, 0.52, 0.05, sofa)
  box(0.4, 0.12, 0.4, mat(0x9b6b4a), -0.2, 0.58, 0.15, sofa)

  // —— Table basse ——
  const table = new THREE.Group()
  table.position.set(-0.5, 0, 2.2)
  root.add(table)
  box(1.6, 0.06, 0.9, wood, 0, 0.42, 0, table)
  ;[[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].forEach(([lx, lz]) => {
    box(0.07, 0.42, 0.07, woodDark, lx, 0.21, lz, table)
  })
  box(0.35, 0.04, 0.25, mat(0xeeeeee), 0.2, 0.46, 0.1, table)
  box(0.08, 0.1, 0.08, mat(0xffffff), -0.3, 0.48, -0.15, table)
  box(0.25, 0.03, 0.18, mat(0xc45c3a), 0.45, 0.46, -0.2, table)

  // —— Fauteuil ——
  const armchair = new THREE.Group()
  armchair.position.set(-5.2, 0, 1.5)
  root.add(armchair)
  box(0.95, 0.4, 0.9, fabricLight, 0, 0.2, 0, armchair)
  box(0.95, 0.55, 0.25, fabric, 0, 0.5, 0.42, armchair)
  box(0.95, 0.35, 0.12, fabricDark, 0, 0.35, -0.48, armchair)

  // —— Bureau complet ——
  const desk = new THREE.Group()
  desk.position.set(4, 0, -2.2)
  root.add(desk)
  box(2, 0.06, 0.95, wood, 0, 0.76, 0, desk)
  ;[[-0.85, -0.35], [0.85, -0.35], [-0.85, 0.35], [0.85, 0.35]].forEach(([lx, lz]) => {
    box(0.08, 0.76, 0.08, woodDark, lx, 0.38, lz, desk)
  })
  box(0.95, 0.52, 0.04, mat(0x111122, { emissive: 0x224466, emissiveIntensity: 0.6 }), 0, 1.1, -0.42, desk)
  box(0.85, 0.04, 0.2, mat(0x1a1a1a), 0, 0.82, -0.15, desk)
  box(0.3, 0.03, 0.15, mat(0x222222), -0.35, 0.8, 0.15, desk)
  box(0.1, 0.02, 0.06, mat(0x333333), 0.2, 0.8, 0.2, desk)
  const chair = new THREE.Group()
  chair.position.set(3.2, 0, -0.8)
  root.add(chair)
  box(0.5, 0.06, 0.5, fabric, 0, 0.48, 0, chair)
  box(0.5, 0.55, 0.06, fabric, 0, 0.75, -0.22, chair)
  box(0.06, 0.5, 0.06, metal, -0.2, 0.25, -0.2, chair)
  box(0.06, 0.5, 0.06, metal, 0.2, 0.25, -0.2, chair)
  box(0.06, 0.5, 0.06, metal, -0.2, 0.25, 0.2, chair)
  box(0.06, 0.5, 0.06, metal, 0.2, 0.25, 0.2, chair)

  // —— Étagère + livres ——
  const shelf = new THREE.Group()
  shelf.position.set(-5.8, 0, -3.8)
  root.add(shelf)
  box(2.2, 0.06, 0.38, wood, 0, 0.4, 0, shelf)
  box(2.2, 0.06, 0.38, wood, 0, 1.05, 0, shelf)
  box(2.2, 0.06, 0.38, wood, 0, 1.7, 0, shelf)
  box(2.2, 0.06, 0.38, wood, 0, 2.35, 0, shelf)
  box(0.06, 2.4, 0.38, woodDark, -1.05, 1.2, 0, shelf)
  box(0.06, 2.4, 0.38, woodDark, 1.05, 1.2, 0, shelf)
  ;[-0.7, -0.35, 0, 0.35, 0.7].forEach((bx, i) => {
    box(0.12, 0.28 + (i % 3) * 0.04, 0.22, mat(bookColors[i % bookColors.length]!), bx, 0.55, 0.02, shelf)
    box(0.1, 0.22, 0.2, mat(bookColors[(i + 2) % bookColors.length]!), bx + 0.15, 1.2, 0.02, shelf)
  })
  box(0.2, 0.25, 0.15, mat(0xc9a227, { metalness: 0.5 }), 0.5, 1.85, 0.05, shelf)

  // —— Meuble TV ——
  const tvUnit = new THREE.Group()
  tvUnit.position.set(0, 0, -4.2)
  root.add(tvUnit)
  box(2.4, 0.5, 0.45, woodDark, 0, 0.25, 0, tvUnit)
  box(1.5, 0.85, 0.06, mat(0x0a0a12, { emissive: 0x112233, emissiveIntensity: 0.4 }), 0, 0.85, -0.2, tvUnit)
  box(0.08, 0.15, 0.08, mat(0x222222), 0.5, 0.55, 0.1, tvUnit)

  // —— Table à manger ——
  const dining = new THREE.Group()
  dining.position.set(2.5, 0, 3.5)
  root.add(dining)
  box(1.4, 0.06, 0.85, wood, 0, 0.78, 0, dining)
  box(0.08, 0.78, 0.08, woodDark, -0.55, 0.39, -0.3, dining)
  box(0.08, 0.78, 0.08, woodDark, 0.55, 0.39, -0.3, dining)
  box(0.08, 0.78, 0.08, woodDark, -0.55, 0.39, 0.3, dining)
  box(0.08, 0.78, 0.08, woodDark, 0.55, 0.39, 0.3, dining)
  ;[[-0.9, 0], [0.9, 0]].forEach(([cx, cz]) => {
    const ch = new THREE.Group()
    ch.position.set(cx, 0, cz)
    dining.add(ch)
    box(0.42, 0.04, 0.42, wood, 0, 0.48, 0, ch)
    box(0.42, 0.45, 0.06, fabricLight, 0, 0.72, -0.15, ch)
    box(0.06, 0.48, 0.06, woodDark, -0.15, 0.24, -0.15, ch)
    box(0.06, 0.48, 0.06, woodDark, 0.15, 0.24, -0.15, ch)
  })
  box(0.15, 0.2, 0.15, mat(0xeeeeee), 0, 0.84, 0, dining)

  // —— Console / buffet ——
  const sideboard = new THREE.Group()
  sideboard.position.set(5.5, 0, 0.5)
  root.add(sideboard)
  box(1.4, 0.85, 0.4, wood, 0, 0.42, 0, sideboard)
  box(1.35, 0.02, 0.36, woodDark, 0, 0.5, 0, sideboard)
  box(0.25, 0.35, 0.25, mat(0x2d5a27), -0.4, 0.9, 0, sideboard)
  box(0.12, 0.2, 0.12, mat(0xc9a227, { metalness: 0.6 }), 0.3, 0.95, 0.05, sideboard)

  // —— Lampe sur pied ——
  const lamp = new THREE.Group()
  lamp.position.set(5.8, 0, 3.8)
  root.add(lamp)
  box(0.35, 0.04, 0.35, woodDark, 0, 0.02, 0, lamp)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.35, 10), wood)
  pole.position.set(0, 0.7, 0)
  pole.castShadow = true
  lamp.add(pole)
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.32, 0.35, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xfff8e7,
      emissive: 0xffcc88,
      emissiveIntensity: 1.5,
      side: THREE.DoubleSide,
    }),
  )
  shade.position.set(0, 1.45, 0)
  lamp.add(shade)

  // —— Plante grande ——
  const plant = new THREE.Group()
  plant.position.set(-5, 0, 4.8)
  root.add(plant)
  const potM = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.24, 0.42, 16),
    mat(0x8b4513),
  )
  potM.position.y = 0.21
  potM.castShadow = true
  plant.add(potM)
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.55 + i * 0.08, 8),
      mat(0x2d6a32),
    )
    leaf.position.set(Math.sin(i) * 0.15, 0.55 + i * 0.12, Math.cos(i) * 0.15)
    plant.add(leaf)
  }

  // —— Tapis secondaire ——
  const rug2 = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.6),
    mat(0x7a3e2f, { roughness: 1 }),
  )
  rug2.rotation.x = -Math.PI / 2
  rug2.position.set(2.5, 0.012, 3.5)
  rug2.receiveShadow = true
  root.add(rug2)

  // —— Cadres muraux ——
  ;[
    { x: -3, y: 1.8, z: -5.95, ry: 0, c: 0xc4a574 },
    { x: 3, y: 2, z: -5.95, ry: 0, c: 0x7eb8a4 },
  ].forEach(({ x, y, z, ry, c }) => {
    const frame = new THREE.Group()
    frame.position.set(x, y, z)
    frame.rotation.y = ry
    root.add(frame)
    box(0.9, 0.65, 0.04, woodDark, 0, 0, 0, frame)
    box(0.75, 0.5, 0.02, mat(c), 0, 0, 0.02, frame)
  })

  // —— Horloge ——
  const clock = new THREE.Group()
  clock.position.set(4, 2.4, -5.92)
  root.add(clock)
  const clockFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.05, 24),
    mat(0xffffff),
  )
  clockFace.rotation.x = Math.PI / 2
  clock.add(clockFace)
  box(0.58, 0.58, 0.03, woodDark, 0, 0, -0.02, clock)

  // —— Applique murale ——
  const sconce = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.25, 0.1),
    mat(0xfff5e0, { emissive: 0xffaa66, emissiveIntensity: 0.8 }),
  )
  sconce.position.set(-6.92, 2.2, -1)
  sconce.rotation.y = Math.PI / 2
  root.add(sconce)

  return root
}

/** Cadre photo au mur (texture cadre + portrait) */
export function buildWallPhotoFrame(
  frameTexture: THREE.Texture,
  photoTexture: THREE.Texture,
  room: { w: number; d: number },
) {
  const group = new THREE.Group()
  group.position.set(-room.w / 2 + 0.11, 1.82, 0.6)
  group.rotation.y = Math.PI / 2

  const w = 0.92
  const h = 0.92
  const depth = 0.04

  frameTexture.colorSpace = THREE.SRGBColorSpace
  photoTexture.colorSpace = THREE.SRGBColorSpace

  // Support bois clair (évite l’ombre portée sur le mur)
  box(
    w + 0.06,
    h + 0.06,
    depth,
    mat(0x6b5238, { emissive: 0x2a2018, emissiveIntensity: 0.25 }),
    0,
    0,
    -0.015,
    group,
    false,
  )

  // Portrait — toujours visible (non affecté par les ombres de la pièce)
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.74, h * 0.74),
    new THREE.MeshBasicMaterial({ map: photoTexture }),
  )
  photo.position.z = depth * 0.5 + 0.008
  group.add(photo)

  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: frameTexture, transparent: true }),
  )
  frame.position.z = depth * 0.5 + 0.032
  group.add(frame)

  // Lumière locale sur le cadre
  const spot = new THREE.PointLight(0xfff4e0, 2.8, 5, 1.2)
  spot.position.set(0.85, 0.15, 0.45)
  group.add(spot)

  return group
}

export function buildWindow(scene: THREE.Scene, room: { w: number; d: number; h: number }) {
  const win = new THREE.Group()
  win.position.set(0, 1.5, room.d / 2 - 0.05)
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1.6, 0.1),
    mat(0x4a3728),
  )
  win.add(frame)
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 1.35),
    new THREE.MeshStandardMaterial({
      color: 0x88bbee,
      emissive: 0xaaccff,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.7,
    }),
  )
  glass.position.z = 0.06
  win.add(glass)
  ;[-1.35, 1.35].forEach((x) => {
    const curtain = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 1.7),
      mat(0x8b7355, { side: THREE.DoubleSide }),
    )
    curtain.position.set(x, 0, 0.08)
    win.add(curtain)
  })
  scene.add(win)
}
