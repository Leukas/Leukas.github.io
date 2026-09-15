import { useEffect, useRef } from 'react'

const MAX_POPS = 6
const FACE_RATIO = 240 / 198

export function PoppingFaces() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let cancelled = false
    let timeout = 0
    let active = 0

    const spawn = () => {
      if (cancelled || !layer) return
      if (active >= MAX_POPS) {
        timeout = window.setTimeout(spawn, 400)
        return
      }

      const mobile = window.matchMedia('(max-width: 700px)').matches
      const size = mobile ? 28 + Math.random() * 36 : 64 + Math.random() * 96
      const duration = 1.4 + Math.random() * 1.4
      const rotate = -25 + Math.random() * 50

      const img = document.createElement('img')
      img.className = 'popping-face'
      img.src = '/me_face.png'
      img.alt = ''
      img.draggable = false
      img.style.left = `${Math.random() * 100}%`
      img.style.top = `${Math.random() * 100}%`
      img.style.width = `${size}px`
      img.style.height = `${size * FACE_RATIO}px`
      img.style.animationDuration = `${duration}s`
      img.style.setProperty('--pop-rotate', `${rotate}deg`)

      const remove = () => {
        img.removeEventListener('animationend', remove)
        img.remove()
        active -= 1
      }
      img.addEventListener('animationend', remove)

      layer.appendChild(img)
      active += 1
      timeout = window.setTimeout(spawn, 350 + Math.random() * 750)
    }

    timeout = window.setTimeout(spawn, 200)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      layer.replaceChildren()
    }
  }, [])

  return <div ref={layerRef} className="popping-faces" aria-hidden="true" />
}
