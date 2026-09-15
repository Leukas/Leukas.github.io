import { useEffect, useRef } from 'react'

const COUNT = 10
const FACE_WIDTH_DESKTOP = 80
const FACE_WIDTH_MOBILE = 42
const SPEED = 160
const DEG = Math.PI / 180
const MAX_FLING = 2800
const FLING_WINDOW_MS = 100
const BREAK_DELAY_MS = 2000
const BREAK_SPEED = SPEED * 4.2

/** Opaque centroid + silhouette half-extents as fractions of face size. */
const HIT_CX = 0.482
const HIT_CY = 0.479
const HIT_RX = 0.42
const HIT_RY = 0.44

function faceWidth() {
  return window.matchMedia('(max-width: 700px)').matches
    ? FACE_WIDTH_MOBILE
    : FACE_WIDTH_DESKTOP
}

function faceHeight(width = faceWidth()) {
  return Math.round((240 / 198) * width)
}

type Face = {
  x: number
  y: number
  vx: number
  vy: number
  spin: number
  rotation: number
  cos: number
  sin: number
}

type DragState = {
  index: number
  pointerId: number
  offsetX: number
  offsetY: number
  samples: { t: number; x: number; y: number }[]
}

function syncRotation(face: Face) {
  const rad = face.rotation * DEG
  face.cos = Math.cos(rad)
  face.sin = Math.sin(rad)
}

function makeFace(
  centerX: number,
  centerY: number,
  w: number,
  h: number,
  vx = 0,
  vy = 0,
): Face {
  const face: Face = {
    x: centerX - w / 2,
    y: centerY - h / 2,
    vx,
    vy,
    spin: 0,
    rotation: -8 + Math.random() * 16,
    cos: 1,
    sin: 0,
  }
  syncRotation(face)
  return face
}

/** 9-ball diamond rack + one cue face breaking from the left. */
function spawnPoolBreak(w: number, h: number): Face[] {
  const spacingX = w * 0.82
  const spacingY = h * 0.72
  const rackCx = window.innerWidth * 0.58
  const rackCy = window.innerHeight * 0.5

  const columns: number[][] = [
    [0],
    [-0.5, 0.5],
    [-1, 0, 1],
    [-0.5, 0.5],
    [0],
  ]

  const racked: Face[] = []
  columns.forEach((rows, col) => {
    for (const row of rows) {
      racked.push(
        makeFace(rackCx + col * spacingX, rackCy + row * spacingY, w, h),
      )
    }
  })

  const cue = makeFace(w * 0.75, rackCy, w, h, 0, 0)
  return [cue, ...racked]
}

function hitCenter(face: Face, w: number, h: number) {
  const ox = HIT_CX * w - w / 2
  const oy = HIT_CY * h - h / 2
  return {
    x: face.x + w / 2 + ox * face.cos - oy * face.sin,
    y: face.y + h / 2 + ox * face.sin + oy * face.cos,
  }
}

function supportRadius(face: Face, nx: number, ny: number, w: number, h: number) {
  const lx = nx * face.cos + ny * face.sin
  const ly = -nx * face.sin + ny * face.cos
  return Math.hypot(HIT_RX * w * lx, HIT_RY * h * ly)
}

function bounceWalls(
  face: Face,
  viewW: number,
  viewH: number,
  w: number,
  h: number,
) {
  const c = hitCenter(face, w, h)
  const extX = supportRadius(face, 1, 0, w, h)
  const extY = supportRadius(face, 0, 1, w, h)

  if (c.x - extX < 0) {
    face.x += extX - c.x
    face.vx = Math.abs(face.vx)
    face.spin = -face.spin
    syncRotation(face)
  } else if (c.x + extX > viewW) {
    face.x -= c.x + extX - viewW
    face.vx = -Math.abs(face.vx)
    face.spin = -face.spin
    syncRotation(face)
  }

  if (c.y - extY < 0) {
    face.y += extY - c.y
    face.vy = Math.abs(face.vy)
    face.spin = -face.spin
    syncRotation(face)
  } else if (c.y + extY > viewH) {
    face.y -= c.y + extY - viewH
    face.vy = -Math.abs(face.vy)
    face.spin = -face.spin
    syncRotation(face)
  }
}

function collideFaces(
  a: Face,
  b: Face,
  w: number,
  h: number,
  freezeA = false,
  freezeB = false,
) {
  if (freezeA && freezeB) return

  const ca = hitCenter(a, w, h)
  const cb = hitCenter(b, w, h)
  const dx = cb.x - ca.x
  const dy = cb.y - ca.y
  const distSq = dx * dx + dy * dy
  if (distSq === 0) return

  const dist = Math.sqrt(distSq)
  const nx = dx / dist
  const ny = dy / dist
  const minDist =
    supportRadius(a, nx, ny, w, h) + supportRadius(b, -nx, -ny, w, h)
  if (dist >= minDist) return

  const push = minDist - dist
  if (freezeA) {
    b.x += nx * push
    b.y += ny * push
  } else if (freezeB) {
    a.x -= nx * push
    a.y -= ny * push
  } else {
    a.x -= (nx * push) / 2
    a.y -= (ny * push) / 2
    b.x += (nx * push) / 2
    b.y += (ny * push) / 2
  }

  if (freezeA || freezeB) {
    const free = freezeA ? b : a
    const incoming = free.vx * nx + free.vy * ny
    const hittingFrozen =
      (freezeA && incoming < 0) || (freezeB && incoming > 0)
    if (hittingFrozen) {
      free.vx -= 2 * incoming * nx
      free.vy -= 2 * incoming * ny
      free.spin = -free.spin
      syncRotation(free)
    }
    return
  }

  const dvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (dvn <= 0) return

  a.vx -= dvn * nx
  a.vy -= dvn * ny
  b.vx += dvn * nx
  b.vy += dvn * ny
  a.spin = -a.spin
  b.spin = -b.spin
  syncRotation(a)
  syncRotation(b)
}

export function BouncingFace() {
  const layerRef = useRef<HTMLDivElement>(null)
  const initialW = typeof window !== 'undefined' ? faceWidth() : FACE_WIDTH_DESKTOP
  const initialH = faceHeight(initialW)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const imgs = [
      ...layer.querySelectorAll<HTMLImageElement>('.bouncing-face'),
    ]
    if (imgs.length === 0) return

    const w = faceWidth()
    const h = faceHeight(w)
    const faces = spawnPoolBreak(w, h)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      faces.forEach((face, i) => {
        imgs[i].style.transform = `translate3d(${face.x}px, ${face.y}px, 0)`
      })
      return
    }

    const breakTimer = window.setTimeout(() => {
      faces[0].vx = BREAK_SPEED
    }, BREAK_DELAY_MS)

    let drag: DragState | null = null
    let frame = 0
    let last = performance.now()

    const recordSample = (x: number, y: number) => {
      if (!drag) return
      const t = performance.now()
      drag.samples.push({ t, x, y })
      while (
        drag.samples.length > 1 &&
        t - drag.samples[0].t > FLING_WINDOW_MS
      ) {
        drag.samples.shift()
      }
    }

    const onPointerDown = (event: PointerEvent) => {
      const img = event.target
      if (!(img instanceof HTMLImageElement)) return
      const index = imgs.indexOf(img)
      if (index < 0) return

      event.preventDefault()
      img.setPointerCapture(event.pointerId)
      const face = faces[index]
      face.vx = 0
      face.vy = 0
      face.spin *= 0.2
      drag = {
        index,
        pointerId: event.pointerId,
        offsetX: event.clientX - face.x,
        offsetY: event.clientY - face.y,
        samples: [
          { t: performance.now(), x: event.clientX, y: event.clientY },
        ],
      }
      img.classList.add('is-dragging')
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return
      const face = faces[drag.index]
      face.x = event.clientX - drag.offsetX
      face.y = event.clientY - drag.offsetY
      face.vx = 0
      face.vy = 0
      recordSample(event.clientX, event.clientY)
    }

    const release = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return
      const face = faces[drag.index]
      const { samples } = drag
      recordSample(event.clientX, event.clientY)

      if (samples.length >= 2) {
        const first = samples[0]
        const latest = samples[samples.length - 1]
        const dt = (latest.t - first.t) / 1000
        if (dt > 0.001) {
          face.vx = (latest.x - first.x) / dt
          face.vy = (latest.y - first.y) / dt
          const speed = Math.hypot(face.vx, face.vy)
          if (speed > MAX_FLING) {
            face.vx *= MAX_FLING / speed
            face.vy *= MAX_FLING / speed
          }
          face.spin = face.vx * 0.08 + face.spin * 0.2
          syncRotation(face)
        }
      }

      imgs[drag.index].classList.remove('is-dragging')
      drag = null
    }

    for (const img of imgs) {
      img.addEventListener('pointerdown', onPointerDown)
      img.addEventListener('pointermove', onPointerMove)
      img.addEventListener('pointerup', release)
      img.addEventListener('pointercancel', release)
    }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const viewW = window.innerWidth
      const viewH = window.innerHeight
      const grabbed = drag?.index ?? -1

      for (let i = 0; i < faces.length; i++) {
        const face = faces[i]
        if (i === grabbed) {
          bounceWalls(face, viewW, viewH, w, h)
          continue
        }
        face.x += face.vx * dt
        face.y += face.vy * dt
        if (face.spin !== 0) {
          face.rotation += face.spin * dt
          syncRotation(face)
        }
        bounceWalls(face, viewW, viewH, w, h)
      }

      for (let i = 0; i < faces.length; i++) {
        for (let j = i + 1; j < faces.length; j++) {
          collideFaces(faces[i], faces[j], w, h, i === grabbed, j === grabbed)
        }
        if (i !== grabbed) bounceWalls(faces[i], viewW, viewH, w, h)
      }

      for (let i = 0; i < faces.length; i++) {
        const face = faces[i]
        imgs[i].style.transform = `translate3d(${face.x}px, ${face.y}px, 0) rotate(${face.rotation}deg)`
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      window.clearTimeout(breakTimer)
      cancelAnimationFrame(frame)
      for (const img of imgs) {
        img.removeEventListener('pointerdown', onPointerDown)
        img.removeEventListener('pointermove', onPointerMove)
        img.removeEventListener('pointerup', release)
        img.removeEventListener('pointercancel', release)
      }
    }
  }, [])

  return (
    <div ref={layerRef} className="bouncing-face-layer" aria-hidden="true">
      {Array.from({ length: COUNT }, (_, i) => (
        <img
          key={i}
          className="bouncing-face"
          src="/me_face.png"
          alt=""
          width={initialW}
          height={initialH}
          draggable={false}
        />
      ))}
    </div>
  )
}
