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

function faceWidth() {
  return window.matchMedia('(max-width: 700px)').matches
    ? FACE_WIDTH_MOBILE
    : FACE_WIDTH_DESKTOP
}

function faceHeight() {
  return Math.round((240 / 198) * faceWidth())
}

/**
 * Boundary samples of opaque alpha from me_face.png (normalized [0,1] UV),
 * inset slightly toward the centroid so contacts hug the visible silhouette.
 */
const HIT_OUTLINE = [
  0.524, 0.0328, 0.5727, 0.0326, 0.2804, 0.0732, 0.3293, 0.0737, 0.3781,
  0.0741, 0.4267, 0.0744, 0.4753, 0.0745, 0.5239, 0.0745, 0.5725, 0.0742,
  0.6212, 0.0739, 0.6701, 0.0734, 0.7191, 0.0729, 0.1826, 0.1134, 0.2318,
  0.114, 0.2809, 0.1146, 0.7186, 0.1143, 0.7677, 0.1137, 0.1338, 0.154,
  0.1832, 0.1546, 0.7672, 0.1549, 0.8165, 0.1543, 0.1343, 0.1951, 0.8159,
  0.1954, 0.8654, 0.1948, 0.0852, 0.2354, 0.1348, 0.236, 0.8649, 0.2357,
  0.0857, 0.2763, 0.8645, 0.2766, 0.0861, 0.3171, 0.864, 0.3173, 0.9138,
  0.3168, 0.0865, 0.3577, 0.9135, 0.3575, 0.0867, 0.3983, 0.9132, 0.3981,
  0.0869, 0.4388, 0.9131, 0.4387, 0.087, 0.4792, 0.913, 0.4792, 0.0869,
  0.5197, 0.913, 0.5198, 0.0868, 0.5602, 0.9132, 0.5603, 0.0865, 0.6008,
  0.8636, 0.6006, 0.9134, 0.6009, 0.0861, 0.6414, 0.1359, 0.6409, 0.8639,
  0.6412, 0.1354, 0.6816, 0.8147, 0.6813, 0.8644, 0.6819, 0.1349, 0.7224,
  0.1844, 0.7217, 0.7659, 0.7214, 0.8153, 0.7221, 0.1838, 0.7627, 0.7665,
  0.7623, 0.1832, 0.8038, 0.718, 0.8028, 0.7671, 0.8035, 0.1827, 0.845,
  0.2319, 0.8444, 0.6696, 0.8435, 0.7185, 0.8441, 0.2314, 0.8857, 0.2805,
  0.8852, 0.6212, 0.8845, 0.67, 0.8849, 0.2801, 0.9266, 0.329, 0.9262,
  0.3779, 0.9258, 0.4266, 0.9256, 0.4753, 0.9255, 0.524, 0.9255, 0.5727,
  0.9257, 0.6215, 0.926, 0.4265, 0.9673, 0.4753, 0.9672,
] as const
const HIT_PAD_X = 0
const HIT_PAD_Y = 0
const OUTLINE_COUNT = HIT_OUTLINE.length / 2

type Face = {
  x: number
  y: number
  vx: number
  vy: number
  spin: number
  rotation: number
}

type DragState = {
  index: number
  pointerId: number
  offsetX: number
  offsetY: number
  samples: { t: number; x: number; y: number }[]
}

function makeFace(
  centerX: number,
  centerY: number,
  vx = 0,
  vy = 0,
): Face {
  return {
    x: centerX - faceWidth() / 2,
    y: centerY - faceHeight() / 2,
    vx,
    vy,
    spin: 0,
    rotation: -8 + Math.random() * 16,
  }
}

/** 9-ball diamond rack + one cue face breaking from the left. */
function spawnPoolBreak(): Face[] {
  const spacingX = faceWidth() * 0.82
  const spacingY = faceHeight() * 0.72
  const rackCx = window.innerWidth * 0.58
  const rackCy = window.innerHeight * 0.5

  // Columns from apex (left) to back (right): 1-2-3-2-1
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
        makeFace(rackCx + col * spacingX, rackCy + row * spacingY),
      )
    }
  })

  const cueX = faceWidth() * 0.75
  // Cue starts still; break velocity is applied after BREAK_DELAY_MS.
  const cue = makeFace(cueX, rackCy, 0, 0)

  return [cue, ...racked]
}

function localToWorld(face: Face, lx: number, ly: number) {
  const cos = Math.cos(face.rotation * DEG)
  const sin = Math.sin(face.rotation * DEG)
  const ox = lx - faceWidth() / 2
  const oy = ly - faceHeight() / 2
  return {
    x: face.x + faceWidth() / 2 + ox * cos - oy * sin,
    y: face.y + faceHeight() / 2 + ox * sin + oy * cos,
  }
}

function outlineBounds(face: Face) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let cx = 0
  let cy = 0

  for (let i = 0; i < HIT_OUTLINE.length; i += 2) {
    const p = localToWorld(
      face,
      HIT_OUTLINE[i] * faceWidth(),
      HIT_OUTLINE[i + 1] * faceHeight(),
    )
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
    cx += p.x
    cy += p.y
  }

  return {
    minX: minX - HIT_PAD_X,
    maxX: maxX + HIT_PAD_X,
    minY: minY - HIT_PAD_Y,
    maxY: maxY + HIT_PAD_Y,
    cx: cx / OUTLINE_COUNT,
    cy: cy / OUTLINE_COUNT,
  }
}

function supportAlong(face: Face, nx: number, ny: number) {
  let best = -Infinity
  for (let i = 0; i < HIT_OUTLINE.length; i += 2) {
    const p = localToWorld(
      face,
      HIT_OUTLINE[i] * faceWidth(),
      HIT_OUTLINE[i + 1] * faceHeight(),
    )
    const proj = p.x * nx + p.y * ny
    if (proj > best) best = proj
  }
  return best + HIT_PAD_X * Math.abs(nx) + HIT_PAD_Y * Math.abs(ny)
}

function bounceWalls(face: Face, width: number, height: number) {
  const b = outlineBounds(face)

  if (b.minX < 0) {
    face.x -= b.minX
    face.vx = Math.abs(face.vx)
    face.spin = -face.spin
  } else if (b.maxX > width) {
    face.x -= b.maxX - width
    face.vx = -Math.abs(face.vx)
    face.spin = -face.spin
  }

  if (b.minY < 0) {
    face.y -= b.minY
    face.vy = Math.abs(face.vy)
    face.spin = -face.spin
  } else if (b.maxY > height) {
    face.y -= b.maxY - height
    face.vy = -Math.abs(face.vy)
    face.spin = -face.spin
  }
}

function collideFaces(
  a: Face,
  b: Face,
  freezeA = false,
  freezeB = false,
) {
  if (freezeA && freezeB) return

  const ba = outlineBounds(a)
  const bb = outlineBounds(b)

  if (
    ba.maxX < bb.minX ||
    bb.maxX < ba.minX ||
    ba.maxY < bb.minY ||
    bb.maxY < ba.minY
  ) {
    return
  }

  const dx = bb.cx - ba.cx
  const dy = bb.cy - ba.cy
  const dist = Math.hypot(dx, dy)
  if (dist === 0) return

  const nx = dx / dist
  const ny = dy / dist
  const aReach = supportAlong(a, nx, ny) - (ba.cx * nx + ba.cy * ny)
  const bReach = supportAlong(b, -nx, -ny) - (bb.cx * -nx + bb.cy * -ny)
  const gap = dist - aReach - bReach
  if (gap >= 0) return

  const push = -gap
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
}

export function BouncingFace() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const imgs = [
      ...layer.querySelectorAll<HTMLImageElement>('.bouncing-face'),
    ]
    if (imgs.length === 0) return

    const faces = spawnPoolBreak()

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
      const width = window.innerWidth
      const height = window.innerHeight
      const grabbed = drag?.index ?? -1

      for (let i = 0; i < faces.length; i++) {
        const face = faces[i]
        if (i === grabbed) {
          bounceWalls(face, width, height)
          continue
        }
        face.x += face.vx * dt
        face.y += face.vy * dt
        face.rotation += face.spin * dt
        bounceWalls(face, width, height)
      }

      for (let i = 0; i < faces.length; i++) {
        for (let j = i + 1; j < faces.length; j++) {
          collideFaces(
            faces[i],
            faces[j],
            i === grabbed,
            j === grabbed,
          )
        }
        if (i !== grabbed) bounceWalls(faces[i], width, height)
      }

      faces.forEach((face, i) => {
        imgs[i].style.transform = `translate3d(${face.x}px, ${face.y}px, 0) rotate(${face.rotation}deg)`
      })

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
          width={faceWidth()}
          height={faceHeight()}
          draggable={false}
        />
      ))}
    </div>
  )
}
