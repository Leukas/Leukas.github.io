import { useEffect, useRef } from 'react'
import { useFacesEnabled } from './FacesPreference'

const SIZE = 28
const SQRT3 = Math.sqrt(3)
const FRAME_MS = 50
const LIFT_MAX = 12

const HEX_CORNERS = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI / 180) * (60 * i - 30)
  return [SIZE * Math.cos(angle), SIZE * Math.sin(angle)] as const
})

const DISCO_COLORS = [
  { r: 255, g: 20, b: 147 },
  { r: 0, g: 245, b: 255 },
  { r: 255, g: 215, b: 0 },
  { r: 57, g: 255, b: 20 },
  { r: 255, g: 90, b: 0 },
  { r: 0, g: 120, b: 255 },
] as const

type Rgb = { r: number; g: number; b: number }
type HexCell = { q: number; r: number; x: number; y: number }

function hexToPixel(q: number, r: number) {
  return {
    x: SIZE * (SQRT3 * q + (SQRT3 / 2) * r),
    y: SIZE * ((3 / 2) * r),
  }
}

function pixelToHex(x: number, y: number) {
  const q = ((SQRT3 / 3) * x - (1 / 3) * y) / SIZE
  const r = ((2 / 3) * y) / SIZE
  return axialRound(q, r)
}

function axialRound(q: number, r: number) {
  const s = -q - r
  let rq = Math.round(q)
  let rr = Math.round(r)
  const rs = Math.round(s)
  const qDiff = Math.abs(rq - q)
  const rDiff = Math.abs(rr - r)
  const sDiff = Math.abs(rs - s)
  if (qDiff > rDiff && qDiff > sDiff) rq = -rr - rs
  else if (rDiff > sDiff) rr = -rq - rs
  return { q: rq, r: rr }
}

function rgba(c: Rgb, a: number) {
  return `rgba(${c.r},${c.g},${c.b},${a})`
}

function drawHex(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fill: string | null,
  stroke: string | null,
  lineWidth = 1,
) {
  ctx.beginPath()
  ctx.moveTo(x + HEX_CORNERS[0]![0], y + HEX_CORNERS[0]![1])
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(x + HEX_CORNERS[i]![0], y + HEX_CORNERS[i]![1])
  }
  ctx.closePath()
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function rgb(r: number, g: number, b: number) {
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
}

/** Color and lift both come from the same animated height — opaque so overlaps don't flash. */
function drawRaisedHex(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  raise: number,
  strokeBase: string,
) {
  const h = Math.min(1, Math.max(0, raise / 0.85))
  const lift = h * LIFT_MAX

  // Opaque: low height → soft grey, high → white
  const top = rgb(mix(220, 255, h), mix(228, 255, h), mix(236, 255, h))
  const sideHi = rgb(mix(188, 228, h), mix(200, 236, h), mix(214, 244, h))
  const sideLo = rgb(mix(172, 200, h), mix(186, 214, h), mix(200, 228, h))

  if (lift < 0.5) {
    drawHex(ctx, x, y, top, strokeBase)
    return
  }

  const topY = y - lift

  for (let i = 0; i < 6; i++) {
    const j = (i + 1) % 6
    const c0 = HEX_CORNERS[i]!
    const c1 = HEX_CORNERS[j]!
    const midY = (c0[1] + c1[1]) / 2
    ctx.beginPath()
    ctx.moveTo(x + c0[0], y + c0[1])
    ctx.lineTo(x + c1[0], y + c1[1])
    ctx.lineTo(x + c1[0], topY + c1[1])
    ctx.lineTo(x + c0[0], topY + c0[1])
    ctx.closePath()
    ctx.fillStyle = midY > 0 ? sideLo : sideHi
    ctx.fill()
  }

  drawHex(ctx, x, topY, top, strokeBase, 1.15)
}

function buildHexes(width: number, height: number) {
  const cells: HexCell[] = []
  const pad = SIZE * 2
  const a = pixelToHex(-pad, -pad)
  const b = pixelToHex(width + pad, -pad)
  const c = pixelToHex(-pad, height + pad)
  const d = pixelToHex(width + pad, height + pad)
  const qMin = Math.min(a.q, b.q, c.q, d.q) - 1
  const qMax = Math.max(a.q, b.q, c.q, d.q) + 1
  const rMin = Math.min(a.r, b.r, c.r, d.r) - 1
  const rMax = Math.max(a.r, b.r, c.r, d.r) + 1

  for (let r = rMin; r <= rMax; r++) {
    for (let q = qMin; q <= qMax; q++) {
      const { x, y } = hexToPixel(q, r)
      if (x < -pad || y < -pad || x > width + pad || y > height + pad) continue
      cells.push({ q, r, x, y })
    }
  }
  return cells
}

function randomRaiseTarget() {
  return Math.random() * 0.85
}

export function HexGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { enabled: funMode } = useFacesEnabled()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const disco = funMode

    let width = 0
    let height = 0
    let hexes: HexCell[] = []
    let drawOrder: number[] = []
    let raises: Float32Array = new Float32Array(0)
    let targets: Float32Array = new Float32Array(0)
    let wait: Float32Array = new Float32Array(0)
    let raf = 0
    let lastFrame = 0
    let cancelled = false

    const grid = document.createElement('canvas')
    let gctx = grid.getContext('2d', { alpha: false })

    const paintGrid = () => {
      if (!gctx) return
      grid.width = width
      grid.height = height

      if (disco) {
        gctx.fillStyle = '#0b0614'
        gctx.fillRect(0, 0, width, height)
        const vig = gctx.createRadialGradient(
          width / 2,
          height * 0.55,
          height * 0.08,
          width / 2,
          height * 0.55,
          height * 0.9,
        )
        vig.addColorStop(0, 'rgba(60, 0, 90, 0.4)')
        vig.addColorStop(1, 'rgba(0, 0, 0, 0.55)')
        gctx.fillStyle = vig
        gctx.fillRect(0, 0, width, height)
      } else {
        gctx.fillStyle = '#eef4f9'
        gctx.fillRect(0, 0, width, height)
      }

      for (const hex of hexes) {
        const t = ((hex.q * 0.37 + hex.r * 0.61) % 1 + 1) % 1
        const stroke = disco
          ? t < 0.5
            ? 'rgba(0,245,255,0.12)'
            : 'rgba(255,20,147,0.1)'
          : t < 0.5
            ? 'rgba(42,122,226,0.08)'
            : 'rgba(20,184,166,0.07)'
        drawHex(gctx, hex.x, hex.y, null, stroke)
      }
    }

    const initRaises = () => {
      const n = hexes.length
      raises = new Float32Array(n)
      targets = new Float32Array(n)
      wait = new Float32Array(n)
      drawOrder = Array.from({ length: n }, (_, i) => i)
      drawOrder.sort(
        (a, b) => hexes[a]!.y - hexes[b]!.y || hexes[a]!.x - hexes[b]!.x,
      )
      for (let i = 0; i < n; i++) {
        targets[i] = randomRaiseTarget()
        raises[i] = targets[i]!
        wait[i] = Math.random() * 5
      }
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      hexes = buildHexes(width, height)
      initRaises()
      gctx = grid.getContext('2d', { alpha: false })
      paintGrid()
      ctx.drawImage(grid, 0, 0)
    }

    const BEAM_HALF = 0.09
    const BEAM_COUNT = 6

    const discoFrame = (now: number) => {
      if (cancelled) return
      raf = window.requestAnimationFrame(discoFrame)

      if (document.hidden) return
      if (now - lastFrame < FRAME_MS) return
      lastFrame = now

      ctx.drawImage(grid, 0, 0)

      const cx = width * 0.5
      const cy = height * 0.5
      const len = Math.hypot(width, height)
      const base = now / 1600

      const beams: Array<{ angle: number; cos: number; sin: number; c: Rgb }> =
        []
      for (let i = 0; i < BEAM_COUNT; i++) {
        const angle =
          base +
          (i * Math.PI * 2) / BEAM_COUNT +
          Math.sin(now / 900 + i * 1.7) * 0.28
        beams.push({
          angle,
          cos: Math.cos(angle),
          sin: Math.sin(angle),
          c: DISCO_COLORS[i % DISCO_COLORS.length]!,
        })
      }

      for (const hex of hexes) {
        let wr = 0
        let wg = 0
        let wb = 0
        let weight = 0
        let a = 0
        for (const beam of beams) {
          const dx = hex.x - cx
          const dy = hex.y - cy
          const rx = dx * beam.cos + dy * beam.sin
          const ry = -dx * beam.sin + dy * beam.cos
          if (rx <= 0) continue
          const half = rx * BEAM_HALF
          if (Math.abs(ry) > half) continue
          const edge = 1 - Math.abs(ry) / half
          const fall = Math.min(1, rx / (len * 0.15)) * (0.55 + 0.45 * edge)
          wr += beam.c.r * fall
          wg += beam.c.g * fall
          wb += beam.c.b * fall
          weight += fall
          a = Math.min(0.72, a + 0.38 * fall)
        }
        if (weight <= 0.02) continue
        const sr = (wr / weight) | 0
        const sg = (wg / weight) | 0
        const sb = (wb / weight) | 0
        drawHex(
          ctx,
          hex.x,
          hex.y,
          `rgba(${sr},${sg},${sb},${a})`,
          `rgba(${sr},${sg},${sb},${Math.min(0.9, a + 0.2)})`,
        )
      }

      for (const beam of beams) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(beam.angle)
        ctx.fillStyle = rgba(beam.c, 0.08)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(len, -len * BEAM_HALF)
        ctx.lineTo(len, len * BEAM_HALF)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
    }

    const seriousFrame = (now: number) => {
      if (cancelled) return
      raf = window.requestAnimationFrame(seriousFrame)

      if (document.hidden) return
      if (now - lastFrame < FRAME_MS) return
      const dt = Math.min(0.08, (now - lastFrame) / 1000)
      lastFrame = now

      for (let i = 0; i < hexes.length; i++) {
        wait[i]! -= dt
        const cur = raises[i]!
        const target = targets[i]!
        if (wait[i]! <= 0 && Math.abs(cur - target) < 0.015) {
          targets[i] = randomRaiseTarget()
          wait[i] = 1.2 + Math.random() * 4.5
        }
        const ease = 0.018 + (i % 7) * 0.003
        raises[i] = cur + (targets[i]! - cur) * Math.min(1, ease * (dt * 60))
      }

      // Full clear + opaque tiles (no per-hex erase over neighbors)
      ctx.fillStyle = '#eef4f9'
      ctx.fillRect(0, 0, width, height)

      for (const i of drawOrder) {
        const hex = hexes[i]!
        const t = ((hex.q * 0.37 + hex.r * 0.61) % 1 + 1) % 1
        const stroke =
          t < 0.5 ? 'rgba(42,122,226,0.1)' : 'rgba(20,184,166,0.09)'
        drawRaisedHex(ctx, hex.x, hex.y, raises[i]!, stroke)
      }
    }

    resize()

    window.addEventListener('resize', resize)

    if (disco && !reduced) {
      lastFrame = 0
      raf = window.requestAnimationFrame(discoFrame)
      return () => {
        cancelled = true
        window.cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
      }
    }

    if (!disco && !reduced) {
      lastFrame = performance.now()
      raf = window.requestAnimationFrame(seriousFrame)
      return () => {
        cancelled = true
        window.cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
      }
    }

    return () => {
      cancelled = true
      window.removeEventListener('resize', resize)
    }
  }, [funMode])

  return (
    <canvas
      ref={canvasRef}
      className={funMode ? 'hex-grid-bg hex-grid-bg-disco' : 'hex-grid-bg'}
      aria-hidden="true"
    />
  )
}
