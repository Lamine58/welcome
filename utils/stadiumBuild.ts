import * as THREE from 'three'

/** Échelle : 1 unité Three.js ≈ 10 m. Terrain réglementaire 105 × 68 m. */
export const PITCH = { length: 10.5, width: 6.8 }

const LINE = 0xffffff
const SCALE = PITCH.length / 105

function m(meters: number) {
  return meters * SCALE
}

export function createPitchTexture() {
  const pw = 1050
  const ph = 680
  const canvas = document.createElement('canvas')
  canvas.width = pw
  canvas.height = ph
  const ctx = canvas.getContext('2d')!

  const stripes = 14
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2f7d32' : '#358f3a'
    ctx.fillRect((pw / stripes) * i, 0, pw / stripes + 1, ph)
  }

  const sx = pw / 105
  const sy = ph / 68
  const lw = Math.max(2, 1.2 * sx)

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = lw
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const margin = 1 * sx
  ctx.strokeRect(margin, margin, pw - margin * 2, ph - margin * 2)

  ctx.beginPath()
  ctx.moveTo(pw / 2, margin)
  ctx.lineTo(pw / 2, ph - margin)
  ctx.stroke()

  const centerR = 9.15 * sx
  ctx.beginPath()
  ctx.arc(pw / 2, ph / 2, centerR, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(pw / 2, ph / 2, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  const drawPenaltyArea = (goalY: number, towardCenter: 1 | -1) => {
    const depth = 16.5 * sy
    const boxW = 40.32 * sx
    const x0 = (pw - boxW) / 2
    const y0 = goalY
    const y1 = goalY + towardCenter * depth
    ctx.strokeRect(x0, Math.min(y0, y1), boxW, Math.abs(y1 - y0))

    const gaDepth = 5.5 * sy
    const gaW = 18.32 * sx
    const gx0 = (pw - gaW) / 2
    const gy1 = goalY + towardCenter * gaDepth
    ctx.strokeRect(gx0, Math.min(goalY, gy1), gaW, Math.abs(gy1 - goalY))

    const spotY = goalY + towardCenter * 11 * sy
    ctx.beginPath()
    ctx.arc(pw / 2, spotY, 3, 0, Math.PI * 2)
    ctx.fill()

    const arcR = 9.15 * sx
    const arcCenterY = spotY
    const angleStart = towardCenter > 0 ? Math.PI * 0.28 : Math.PI * 1.72
    const angleEnd = towardCenter > 0 ? Math.PI * 0.72 : Math.PI * 1.28
    ctx.beginPath()
    ctx.arc(pw / 2, arcCenterY, arcR, angleStart, angleEnd)
    ctx.stroke()
  }

  drawPenaltyArea(margin, 1)
  drawPenaltyArea(ph - margin, -1)

  const cornerR = 1 * sx
  ;[
    [margin, margin],
    [pw - margin, margin],
    [margin, ph - margin],
    [pw - margin, ph - margin],
  ].forEach(([cx, cy], i) => {
    const start = [0, Math.PI / 2, Math.PI, Math.PI * 1.5][i]!
    ctx.beginPath()
    ctx.arc(cx, cy, cornerR, start, start + Math.PI / 2)
    ctx.stroke()
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function lineMat() {
  return new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 })
}

export function buildGoals(parent: THREE.Object3D) {
  const halfL = PITCH.length / 2
  const goalW = m(7.32)
  const goalH = m(2.44)
  const postR = m(0.06)

  ;[-1, 1].forEach((side) => {
    const goal = new THREE.Group()
    goal.position.z = side * halfL
    parent.add(goal)

    const postMat = lineMat()
    const left = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, goalH, 8), postMat)
    left.position.set(-goalW / 2, goalH / 2, side * m(0.08))
    goal.add(left)

    const right = left.clone()
    right.position.x = goalW / 2
    goal.add(right)

    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, goalW, 8), postMat)
    crossbar.rotation.z = Math.PI / 2
    crossbar.position.set(0, goalH, side * m(0.08))
    goal.add(crossbar)

    const net = new THREE.Mesh(
      new THREE.PlaneGeometry(goalW, goalH),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        wireframe: true,
      }),
    )
    net.position.set(0, goalH / 2, side * m(0.35))
    goal.add(net)
  })
}

export function buildCornerFlags(parent: THREE.Object3D) {
  const halfL = PITCH.length / 2
  const halfW = PITCH.width / 2
  const poleH = m(1.5)

  ;[
    [-halfW, -halfL],
    [halfW, -halfL],
    [-halfW, halfL],
    [halfW, halfL],
  ].forEach(([x, z], i) => {
    const flag = new THREE.Group()
    flag.position.set(x, 0, z)
    parent.add(flag)

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(m(0.02), m(0.025), poleH, 6),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.4 }),
    )
    pole.position.y = poleH / 2
    flag.add(pole)

    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(m(0.35), m(0.25)),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xffd93d : 0xe84a5f,
        side: THREE.DoubleSide,
      }),
    )
    cloth.position.set(m(0.18), poleH - m(0.12), 0)
    flag.add(cloth)
  })
}

export function buildStands(parent: THREE.Object3D) {
  const halfL = PITCH.length / 2 + m(2)
  const halfW = PITCH.width / 2 + m(2)
  const standMat = new THREE.MeshStandardMaterial({ color: 0x5a6478, roughness: 0.85 })
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x3d4a5c, roughness: 0.9 })

  const buildStand = (w: number, d: number, x: number, z: number, rotY: number, tiers: number) => {
    const stand = new THREE.Group()
    stand.position.set(x, 0, z)
    stand.rotation.y = rotY
    parent.add(stand)

    for (let t = 0; t < tiers; t++) {
      const tier = new THREE.Mesh(new THREE.BoxGeometry(w, m(1.2), d), t === 0 ? standMat : seatMat)
      tier.position.set(0, m(0.6) + t * m(1.1), -t * m(0.9))
      stand.add(tier)
    }
  }

  buildStand(PITCH.width + m(8), m(3), 0, -halfL, 0, 4)
  buildStand(PITCH.width + m(8), m(3), 0, halfL, Math.PI, 4)
  buildStand(PITCH.length + m(6), m(3), -halfW, 0, Math.PI / 2, 3)
  buildStand(PITCH.length + m(6), m(3), halfW, 0, -Math.PI / 2, 3)
}

export function buildFloodlights(parent: THREE.Object3D) {
  const halfL = PITCH.length / 2 + m(5)
  const halfW = PITCH.width / 2 + m(5)

  ;[
    [-halfW, -halfL],
    [halfW, -halfL],
    [-halfW, halfL],
    [halfW, halfL],
  ].forEach(([x, z]) => {
    const tower = new THREE.Group()
    tower.position.set(x, 0, z)
    parent.add(tower)

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(m(0.08), m(0.12), m(12), 8),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5 }),
    )
    pole.position.y = m(6)
    tower.add(pole)

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(m(1.8), m(0.35), m(0.6)),
      new THREE.MeshStandardMaterial({
        color: 0xfff8e7,
        emissive: 0xffcc66,
        emissiveIntensity: 0.9,
      }),
    )
    head.position.set(0, m(12), 0)
    head.lookAt(0, 0, 0)
    tower.add(head)

    const light = new THREE.SpotLight(0xfff4e0, 120, m(35), Math.PI / 5, 0.4, 1.2)
    light.position.set(0, m(12), 0)
    light.target.position.set(0, 0, 0)
    tower.add(light)
    tower.add(light.target)
  })
}

export function buildFootballPitch(parent: THREE.Object3D, loadedTextures: THREE.Texture[] = []) {
  const pitchTex = createPitchTexture()
  loadedTextures.push(pitchTex)

  const pitch = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH.width, PITCH.length),
    new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.95 }),
  )
  pitch.rotation.x = -Math.PI / 2
  pitch.receiveShadow = true
  parent.add(pitch)

  const surround = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH.width + m(12), PITCH.length + m(12)),
    new THREE.MeshStandardMaterial({ color: 0xc45c2a, roughness: 0.95 }),
  )
  surround.rotation.x = -Math.PI / 2
  surround.position.y = -0.01
  parent.add(surround)

  buildGoals(parent)
  buildCornerFlags(parent)
  return pitch
}
