import { useEffect, useRef, useState } from 'react'

const MAX_POPS = 12
const FACE_RATIO = 240 / 198
const GOAL = 100

const HIGH_SCORES = [
  { name: 'Lukas (mobile)', accuracy: 81 },
  { name: 'Lukas (desktop)', accuracy: 64 },
  { name: 'Lukas (trackpad)', accuracy: 33 },
] as const

export function PoppingFaces() {
  const layerRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [scoreOpen, setScoreOpen] = useState(false)
  const [bump, setBump] = useState(0)
  const [finished, setFinished] = useState(false)
  const [boardOpen, setBoardOpen] = useState(false)

  const accuracy = attempts === 0 ? 100 : Math.round((hits / attempts) * 100)

  const boardRows = [
    ...HIGH_SCORES.map((entry) => ({ ...entry, you: false })),
    { name: 'You', accuracy, you: true },
  ].sort((a, b) => b.accuracy - a.accuracy)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let cancelled = false
    let finished = false
    let timeout = 0
    let active = 0
    let scoring = false
    let localScore = 0
    let localHits = 0
    let localAttempts = 0

    const pauseGame = () => {
      finished = true
      window.clearTimeout(timeout)
      for (const face of layer.querySelectorAll('.popping-face')) {
        face.remove()
      }
      active = 0
      setFinished(true)
      setBoardOpen(true)
    }

    const award = (points: number, x: number, y: number) => {
      if (finished) return
      scoring = true
      localScore += points
      localHits += 1
      localAttempts += 1
      setScore(localScore)
      setHits(localHits)
      setAttempts(localAttempts)
      setScoreOpen(true)
      setBump((n) => n + 1)

      const float = document.createElement('span')
      float.className = 'mole-float'
      float.textContent = `+${points}`
      float.style.left = `${x}px`
      float.style.top = `${y}px`
      layer.appendChild(float)
      float.addEventListener(
        'animationend',
        () => {
          float.remove()
        },
        { once: true },
      )

      if (localScore >= GOAL) {
        pauseGame()
      }
    }

    const spawn = () => {
      if (cancelled || finished || !layer) return
      if (active >= MAX_POPS) {
        timeout = window.setTimeout(spawn, 400)
        return
      }

      const mobile = window.matchMedia('(max-width: 700px)').matches
      const size = mobile ? 28 + Math.random() * 36 : 64 + Math.random() * 96
      const duration = 2.2 + Math.random() * 1.6
      const rotate = -25 + Math.random() * 50
      const points = size < (mobile ? 40 : 90) ? 3 : size < (mobile ? 52 : 120) ? 2 : 1

      const img = document.createElement('img')
      img.className = 'popping-face'
      img.src = '/me_face.png'
      img.alt = ''
      img.draggable = false

      const header = document.querySelector('.site-header')
      const headerBottom = header?.getBoundingClientRect().bottom ?? 72
      const height = size * FACE_RATIO
      const minTop = headerBottom + height / 2 + 8
      const maxTop = window.innerHeight - height / 2 - 8
      const topPx =
        maxTop > minTop ? minTop + Math.random() * (maxTop - minTop) : minTop

      img.style.left = `${8 + Math.random() * 84}%`
      img.style.top = `${topPx}px`
      img.style.width = `${size}px`
      img.style.height = `${height}px`
      img.style.animationDuration = `${duration}s`
      img.style.setProperty('--pop-rotate', `${rotate}deg`)

      let hit = false
      const countsForAccuracy = scoring

      const remove = () => {
        img.removeEventListener('animationend', remove)
        img.removeEventListener('pointerdown', onHit)
        if (!hit && countsForAccuracy && !finished) {
          localAttempts += 1
          setAttempts(localAttempts)
        }
        img.remove()
        active -= 1
      }

      const onHit = (event: PointerEvent) => {
        if (hit || finished) return
        hit = true
        event.preventDefault()
        event.stopPropagation()
        img.classList.add('popping-face-whacked')
        img.style.animationDuration = '0.28s'
        award(points, event.clientX, event.clientY)
      }

      img.addEventListener('animationend', remove)
      img.addEventListener('pointerdown', onHit)

      layer.appendChild(img)
      active += 1
      timeout = window.setTimeout(spawn, 120 + Math.random() * 280)
    }

    timeout = window.setTimeout(spawn, 200)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      layer.replaceChildren()
    }
  }, [])

  return (
    <>
      <div ref={layerRef} className="popping-faces" aria-hidden="true" />
      {scoreOpen && !finished ? (
        <div
          className={`mole-score${bump ? ' mole-score-bump' : ''}`}
          key={bump}
          role="status"
          aria-live="polite"
        >
          <div className="mole-score-row">
            <span className="mole-score-label">Score</span>
            <span className="mole-score-value">{score}</span>
            <span className="mole-score-hint">(get to 100!)</span>
          </div>
          <div className="mole-score-row">
            <span className="mole-score-label">Accuracy</span>
            <span className="mole-score-value mole-score-accuracy">{accuracy}%</span>
          </div>
        </div>
      ) : null}
      {boardOpen ? (
        <div className="mole-board" role="dialog" aria-label="High scores">
          <button
            type="button"
            className="mole-board-close"
            onClick={() => setBoardOpen(false)}
            aria-label="Close high scores"
          >
            ×
          </button>
          <p className="mole-board-kicker">Score {GOAL}</p>
          <h2 className="mole-board-title">High Scores</h2>
          <ol className="mole-board-list">
            {boardRows.map((row) => (
              <li
                key={row.name}
                className={row.you ? 'mole-board-row is-you' : 'mole-board-row'}
              >
                <span className="mole-board-name">{row.name}</span>
                <span className="mole-board-acc">{row.accuracy}%</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </>
  )
}
