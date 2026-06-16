import * as THREE from 'three'

function mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, ...opts })
}

function box(
  w: number,
  h: number,
  d: number,
  material: THREE.MeshStandardMaterial,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  m.position.set(x, y, z)
  parent.add(m)
  return m
}

function buildGift(
  parent: THREE.Object3D,
  x: number,
  z: number,
  w: number,
  h: number,
  d: number,
  wrap: number,
  ribbon: number,
  rotY = 0,
) {
  const gift = new THREE.Group()
  gift.position.set(x, h / 2, z)
  gift.rotation.y = rotY
  parent.add(gift)

  box(w, h * 0.72, d, mat(wrap), 0, -h * 0.14, 0, gift)
  box(w * 1.02, h * 0.3, d * 1.02, mat(wrap, { roughness: 0.65 }), 0, h * 0.18, 0, gift)
  box(w * 1.06, 0.035, 0.07, mat(ribbon, { metalness: 0.35, roughness: 0.4 }), 0, 0, 0, gift)
  box(0.07, h * 1.02, 0.035, mat(ribbon, { metalness: 0.35, roughness: 0.4 }), 0, 0, 0, gift)

  const bow = new THREE.Group()
  bow.position.set(0, h * 0.34, 0)
  gift.add(bow)
  ;[-1, 1].forEach((side) => {
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.018, 8, 16, Math.PI),
      mat(ribbon, { metalness: 0.4 }),
    )
    loop.position.set(side * 0.045, 0, 0)
    loop.rotation.y = Math.PI / 2
    loop.rotation.z = side > 0 ? -0.35 : 0.35
    bow.add(loop)
  })
  box(0.05, 0.04, 0.05, mat(ribbon, { metalness: 0.45 }), 0, 0, 0, bow)
}

function buildCake(parent: THREE.Object3D, y: number) {
  const setup = new THREE.Group()
  setup.position.set(0, y, 0)
  parent.add(setup)

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.36, 0.025, 32),
    mat(0xf5f0e8, { roughness: 0.35, metalness: 0.08 }),
  )
  plate.position.y = 0.012
  setup.add(plate)

  const plateRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.335, 0.012, 8, 32),
    mat(0xc9a227, { metalness: 0.55, roughness: 0.35 }),
  )
  plateRim.rotation.x = Math.PI / 2
  plateRim.position.y = 0.02
  setup.add(plateRim)

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.25, 0.11, 32),
    mat(0x5c3d2e, { roughness: 0.85 }),
  )
  base.position.y = 0.08
  setup.add(base)

  const cream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.255, 0.24, 0.1, 32),
    mat(0xfff8f0, { roughness: 0.45 }),
  )
  cream.position.y = 0.185
  setup.add(cream)

  const drip = new THREE.Mesh(
    new THREE.TorusGeometry(0.245, 0.018, 8, 32),
    mat(0xfff8f0, { roughness: 0.5 }),
  )
  drip.rotation.x = Math.PI / 2
  drip.position.y = 0.145
  setup.add(drip)

  ;[0, 1, 2, 3, 4].forEach((i) => {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
    const berry = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 10, 10),
      mat(0xc62828, { roughness: 0.55 }),
    )
    berry.position.set(Math.cos(angle) * 0.14, 0.24, Math.sin(angle) * 0.14)
    berry.scale.y = 0.85
    setup.add(berry)
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.012, 0.035, 4),
      mat(0x2d6a32),
    )
    leaf.position.set(Math.cos(angle) * 0.14 + 0.02, 0.255, Math.sin(angle) * 0.14)
    leaf.rotation.z = angle
    setup.add(leaf)
  })

  ;[-0.06, 0, 0.06].forEach((cx, i) => {
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.09, 10),
      mat(i === 1 ? 0xc9a227 : 0xfff8f0, { roughness: 0.4 }),
    )
    candle.position.set(cx, 0.28, 0)
    setup.add(candle)
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 8, 8),
      mat(0xffcc66, { emissive: 0xff8833, emissiveIntensity: 1.5 }),
    )
    flame.position.set(cx, 0.345, 0)
    flame.scale.set(0.8, 1.35, 0.8)
    setup.add(flame)
  })
}

function addString(
  parent: THREE.Object3D,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
) {
  const dx = x1 - x0
  const dy = y1 - y0
  const dz = z1 - z0
  const len = Math.hypot(dx, dy, dz)
  if (len < 0.04) return

  const string = new THREE.Mesh(
    new THREE.CylinderGeometry(0.002, 0.002, len, 4),
    mat(0xbbb8b0, { roughness: 1 }),
  )
  string.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
  string.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(dx, dy, dz).normalize(),
  )
  parent.add(string)
}

function buildBalloon(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  color: number,
  anchor: THREE.Vector3,
) {
  const g = new THREE.Group()
  g.position.set(x, y, z)
  parent.add(g)

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 16),
    mat(color, { roughness: 0.28, metalness: 0.05 }),
  )
  body.scale.set(1, 1.22, 1)
  g.add(body)

  const shine = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    mat(0xffffff, { transparent: true, opacity: 0.35, roughness: 0.2 }),
  )
  shine.position.set(-0.035, 0.04, 0.045)
  g.add(shine)

  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), mat(color, { roughness: 0.5 }))
  knot.position.y = -0.13
  g.add(knot)

  addString(parent, anchor.x, anchor.y, anchor.z, x, y - 0.13, z)
}

function buildBalloonBouquet(parent: THREE.Object3D, x: number, z: number) {
  const bouquet = new THREE.Group()
  bouquet.position.set(x, 0, z)
  parent.add(bouquet)

  box(0.18, 0.06, 0.14, mat(0x4a3728), 0, 0.03, 0, bouquet)
  const weight = box(0.13, 0.05, 0.1, mat(0xc9a227, { metalness: 0.55, roughness: 0.35 }), 0, 0.085, 0, bouquet)
  weight.rotation.y = 0.2

  const anchor = new THREE.Vector3(0, 0.11, 0)
  const palette = [0xe84a5f, 0xc9a227, 0xf5f0e8, 0xd4846a, 0x7eb8a4, 0x9b8ec4]
  palette.forEach((color, i) => {
    const angle = (i / palette.length) * Math.PI * 2 + 0.3
    const bx = Math.sin(angle) * 0.14
    const bz = Math.cos(angle) * 0.1
    const by = 0.95 + (i % 3) * 0.24
    buildBalloon(bouquet, bx, by, bz, color, anchor)
  })
}

function buildPartyTable(parent: THREE.Object3D) {
  const table = new THREE.Group()
  parent.add(table)

  const tableH = 0.76
  const wood = mat(0x6b4423)
  const woodDark = mat(0x4a3728)

  ;[0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((angle) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, tableH, 10), woodDark)
    leg.position.set(Math.cos(angle) * 0.42, tableH / 2, Math.sin(angle) * 0.42)
    table.add(leg)
  })

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.6, 0.055, 32),
    wood,
  )
  top.position.y = tableH
  table.add(top)

  const clothTop = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 32),
    mat(0xfff8f0, { roughness: 0.92, side: THREE.DoubleSide }),
  )
  clothTop.rotation.x = -Math.PI / 2
  clothTop.position.y = tableH + 0.028
  table.add(clothTop)

  const clothSkirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.72, 0.22, 32, 1, true),
    mat(0xfff8f0, { roughness: 0.95, side: THREE.DoubleSide }),
  )
  clothSkirt.position.y = tableH - 0.08
  table.add(clothSkirt)

  return tableH
}

function makeWallBannerTexture(name: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 160
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#faf6f0'
  ctx.fillRect(0, 0, 768, 160)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 6
  ctx.strokeRect(10, 10, 748, 140)

  ctx.fillStyle = '#c9a227'
  for (let i = 0; i < 9; i++) {
    const x = 48 + i * 78
    ctx.beginPath()
    ctx.moveTo(x, 18)
    ctx.lineTo(x + 34, 18)
    ctx.lineTo(x + 17, 38)
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillStyle = '#4a3728'
  ctx.font = '700 38px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`Joyeux anniversaire, ${name}`, 384, 92)

  ctx.font = '500 18px system-ui, sans-serif'
  ctx.fillStyle = '#8b7355'
  ctx.fillText('16 juin', 384, 128)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function buildCeilingGarland(parent: THREE.Object3D) {
  const colors = [0xc9a227, 0xd4846a, 0x7eb8a4, 0x9b8ec4, 0xe8ddd0]
  const points: THREE.Vector3[] = []
  const segments = 14
  const span = 3.6

  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1)
    const x = -span / 2 + t * span
    const sag = Math.sin(t * Math.PI) * 0.28
    points.push(new THREE.Vector3(x, 2.62 - sag, 0))
  }

  const curve = new THREE.CatmullRomCurve3(points)
  const ropePoints = curve.getPoints(40)
  const ropeGeo = new THREE.BufferGeometry().setFromPoints(ropePoints)
  const rope = new THREE.Line(
    ropeGeo,
    new THREE.LineBasicMaterial({ color: 0xd9cfc2 }),
  )
  parent.add(rope)

  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1)
    const x = -span / 2 + t * span
    const sag = Math.sin(t * Math.PI) * 0.28
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.16),
      mat(colors[i % colors.length]!, { roughness: 0.85, side: THREE.DoubleSide }),
    )
    flag.position.set(x, 2.48 - sag, 0.02)
    flag.rotation.x = -0.08
    parent.add(flag)
  }
}

function buildStreamers(parent: THREE.Object3D, lite: boolean) {
  if (lite) return
  const colors = [0xc9a227, 0xd4846a, 0x7eb8a4, 0x9b8ec4]
  colors.forEach((color, i) => {
    const streamer = new THREE.Mesh(
      new THREE.PlaneGeometry(0.06, 1.1),
      mat(color, { side: THREE.DoubleSide, roughness: 0.9 }),
    )
    const angle = (i / colors.length) * Math.PI * 2
    streamer.position.set(Math.cos(angle) * 0.18, 2.35, Math.sin(angle) * 0.18)
    streamer.rotation.y = angle
    streamer.rotation.x = 0.15
    parent.add(streamer)
  })
}

export function buildBirthdayDecor(
  parent: THREE.Object3D,
  name = 'Lamine',
  lite = false,
  loadedTextures: THREE.Texture[] = [],
) {
  const party = new THREE.Group()
  party.position.set(0, 0, 0.05)
  parent.add(party)

  const rug = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 1.35, 48),
    mat(0x6b3a2a, { roughness: 1 }),
  )
  rug.rotation.x = -Math.PI / 2
  rug.position.y = 0.016
  party.add(rug)

  const tableH = buildPartyTable(party)
  buildCake(party, tableH + 0.04)
  buildBalloonBouquet(party, 0.88, 0.42)

  buildGift(party, -0.82, 0.62, 0.28, 0.22, 0.24, 0x7eb8a4, 0xc9a227, 0.4)
  buildGift(party, 0.85, 0.58, 0.24, 0.18, 0.26, 0xd4846a, 0xfff8f0, -0.3)
  buildGift(party, -0.68, -0.72, 0.26, 0.2, 0.22, 0x9b8ec4, 0xc9a227, 0.55)
  buildGift(party, 0.72, -0.78, 0.3, 0.24, 0.2, 0xc9a227, 0x4a3728, -0.45)

  if (!lite) {
    box(0.04, 0.12, 0.04, mat(0xc9a227, { metalness: 0.6 }), 0.38, tableH + 0.08, 0.18, party)
    box(0.04, 0.12, 0.04, mat(0xc9a227, { metalness: 0.6 }), -0.35, tableH + 0.08, -0.15, party)
  }

  buildCeilingGarland(party)
  buildStreamers(party, lite)

  const bannerTex = makeWallBannerTexture(name)
  loadedTextures.push(bannerTex)
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.54),
    new THREE.MeshBasicMaterial({ map: bannerTex, fog: false }),
  )
  banner.position.set(-0.5, 2.38, -5.97)
  party.add(banner)

  if (!lite) {
    const glow = new THREE.PointLight(0xffd8a8, 0.9, 2.8, 1.6)
    glow.position.set(0, tableH + 0.55, 0.1)
    party.add(glow)
  }

  return party
}
