import { useEffect, useRef } from 'react'

const BODY_RATIO = 509 / 842
const DEG = Math.PI / 180
const MAX_FLING = 3200
const FLING_WINDOW_MS = 100
const HIT_CY = 0.48
const HIT_RY = 0.42

type Body = {
  lockedX: number
  x: number
  y: number
  vy: number
  spin: number
  rotation: number
  w: number
  h: number
}

type DragState = {
  index: number
  pointerId: number
  offsetY: number
  samples: { t: number; y: number }[]
}

function bodyHeight() {
  const viewH = window.innerHeight
  if (window.innerWidth <= 700) return Math.min(viewH * 0.36, 240)
  if (window.innerWidth <= 1100) return Math.min(viewH * 0.42, 320)
  return Math.min(viewH * 0.58, 480)
}

/** Original CSS peeker placement, converted to top-left + rotation. */
function spawnPeekers(): Body[] {
  const h = bodyHeight()
  const w = h * BODY_RATIO
  const viewW = window.innerWidth
  const viewH = window.innerHeight
  const narrow = window.innerWidth <= 700
  const mid = window.innerWidth <= 1100

  // Left: left:0; top:38%; translate(-48%/-54%/-55%, -50%) rotate(30deg)
  const leftTx = narrow ? -0.55 : mid ? -0.54 : -0.48
  const leftTop = narrow ? 0.32 : 0.38
  const leftX = leftTx * w
  const leftY = viewH * leftTop - 0.5 * h

  // Right: right:0; bottom:0; translate(32%/38%/45%, 12%/18%) rotate(-30deg)
  const rightTx = narrow ? 0.45 : mid ? 0.38 : 0.32
  const rightTy = narrow ? 0.18 : 0.12
  const rightX = viewW - w + rightTx * w
  const rightY = viewH - h + rightTy * h

  return [
    {
      lockedX: leftX,
      x: leftX,
      y: leftY,
      vy: 0,
      spin: 0,
      rotation: 30,
      w,
      h,
    },
    {
      lockedX: rightX,
      x: rightX,
      y: rightY,
      vy: 0,
      spin: 0,
      rotation: -30,
      w,
      h,
    },
  ]
}

function hitY(body: Body) {
  const oy = HIT_CY * body.h - body.h / 2
  const rad = body.rotation * DEG
  return body.y + body.h / 2 + oy * Math.cos(rad)
}

function verticalExtent(body: Body) {
  const rad = body.rotation * DEG
  const rx = body.w * 0.32
  const ry = body.h * HIT_RY
  return Math.hypot(rx * Math.sin(rad), ry * Math.cos(rad))
}

function bounceVertical(body: Body, viewH: number) {
  const cy = hitY(body)
  const ext = verticalExtent(body)

  if (cy - ext < 0) {
    body.y += ext - cy
    body.vy = Math.abs(body.vy)
    body.spin = -body.spin
  } else if (cy + ext > viewH) {
    body.y -= cy + ext - viewH
    body.vy = -Math.abs(body.vy)
    body.spin = -body.spin
  }

  body.x = body.lockedX
}

export function CvPeekers() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const imgs = [...layer.querySelectorAll<HTMLImageElement>('.cv-peeker-img')]
    if (imgs.length < 2) return

    const bodies = spawnPeekers()

    bodies.forEach((body, i) => {
      imgs[i].style.width = `${body.w}px`
      imgs[i].style.height = `${body.h}px`
      imgs[i].style.transform = `translate3d(${body.x}px, ${body.y}px, 0) rotate(${body.rotation}deg)`
    })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let drag: DragState | null = null
    let frame = 0
    let last = performance.now()

    const recordSample = (y: number) => {
      if (!drag) return
      const t = performance.now()
      drag.samples.push({ t, y })
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
      const body = bodies[index]
      body.vy = 0
      body.spin *= 0.15
      drag = {
        index,
        pointerId: event.pointerId,
        offsetY: event.clientY - body.y,
        samples: [{ t: performance.now(), y: event.clientY }],
      }
      img.classList.add('is-dragging')
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return
      const body = bodies[drag.index]
      body.y = event.clientY - drag.offsetY
      body.x = body.lockedX
      body.vy = 0
      recordSample(event.clientY)
    }

    const release = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return
      const body = bodies[drag.index]
      const { samples } = drag
      recordSample(event.clientY)

      if (samples.length >= 2) {
        const first = samples[0]
        const latest = samples[samples.length - 1]
        const dt = (latest.t - first.t) / 1000
        if (dt > 0.001) {
          body.vy = (latest.y - first.y) / dt
          if (Math.abs(body.vy) > MAX_FLING) {
            body.vy = Math.sign(body.vy) * MAX_FLING
          }
          body.spin = body.vy * 0.04
        }
      }

      body.x = body.lockedX
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
      const viewH = window.innerHeight
      const grabbed = drag?.index ?? -1

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i]
        body.x = body.lockedX
        if (i === grabbed) {
          bounceVertical(body, viewH)
          continue
        }
        body.y += body.vy * dt
        if (body.spin !== 0) body.rotation += body.spin * dt
        body.vy *= 0.998
        body.spin *= 0.997
        bounceVertical(body, viewH)
      }

      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i]
        imgs[i].style.transform = `translate3d(${body.lockedX}px, ${body.y}px, 0) rotate(${body.rotation}deg)`
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
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
    <div ref={layerRef} className="cv-peeker-layer" aria-hidden="true">
      <img
        className="cv-peeker-img"
        src="/me_body.png"
        alt=""
        draggable={false}
      />
      <img
        className="cv-peeker-img"
        src="/me_body.png"
        alt=""
        draggable={false}
      />
    </div>
  )
}
