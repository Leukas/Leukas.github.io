import { useEffect, useState } from 'react'

type Pop = {
  id: number
  x: number
  y: number
  size: number
  duration: number
  rotate: number
}

const MAX_POPS = 8
const FACE_RATIO = 240 / 198

export function PoppingFaces() {
  const [pops, setPops] = useState<Pop[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let id = 0
    let cancelled = false
    let timeout = 0

    const spawn = () => {
      if (cancelled) return

      const mobile = window.matchMedia('(max-width: 700px)').matches
      const size = mobile
        ? 28 + Math.random() * 36
        : 64 + Math.random() * 96
      const pop: Pop = {
        id: id++,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        duration: 1.4 + Math.random() * 1.4,
        rotate: -25 + Math.random() * 50,
      }

      setPops((current) => [...current.slice(-(MAX_POPS - 1)), pop])

      timeout = window.setTimeout(spawn, 280 + Math.random() * 700)
    }

    timeout = window.setTimeout(spawn, 200)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="popping-faces" aria-hidden="true">
      {pops.map((pop) => (
        <img
          key={pop.id}
          className="popping-face"
          src="/me_face.png"
          alt=""
          draggable={false}
          style={{
            left: `${pop.x}%`,
            top: `${pop.y}%`,
            width: pop.size,
            height: pop.size * FACE_RATIO,
            animationDuration: `${pop.duration}s`,
            ['--pop-rotate' as string]: `${pop.rotate}deg`,
          }}
          onAnimationEnd={() => {
            setPops((current) => current.filter((p) => p.id !== pop.id))
          }}
        />
      ))}
    </div>
  )
}
