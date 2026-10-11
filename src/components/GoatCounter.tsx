import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '../data/site'

type GoatCounterApi = {
  count?: (vars?: { path?: string; title?: string }) => void
  no_onload?: boolean
}

declare global {
  interface Window {
    goatcounter?: GoatCounterApi
  }
}

const SCRIPT_SRC = 'https://gc.zgo.at/count.js'

function ensureScript() {
  window.goatcounter = { ...(window.goatcounter ?? {}), no_onload: true }
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return

  const script = document.createElement('script')
  script.async = true
  script.src = SCRIPT_SRC
  script.dataset.goatcounter = `https://${site.goatcounter}.goatcounter.com/count`
  document.body.appendChild(script)
}

/** Loads GoatCounter and records SPA navigations. */
export function GoatCounter() {
  const location = useLocation()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    ensureScript()
  }, [])

  useEffect(() => {
    const path =
      `${location.pathname}${location.search}${location.hash}` || '/'
    if (lastPath.current === path) return
    lastPath.current = path

    const send = () => {
      if (!window.goatcounter?.count) return false
      window.goatcounter.count({ path })
      return true
    }

    if (send()) return

    const id = window.setInterval(() => {
      if (send()) window.clearInterval(id)
    }, 120)
    return () => window.clearInterval(id)
  }, [location.pathname, location.search, location.hash])

  return null
}
