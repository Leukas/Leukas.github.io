import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'faces-enabled'

type FacesContextValue = {
  enabled: boolean
  toggle: () => void
}

const FacesContext = createContext<FacesContextValue | null>(null)

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function FacesProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(readStored)

  const toggle = () => {
    setEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore quota / private mode */
      }
      return next
    })
  }

  return (
    <FacesContext.Provider value={{ enabled, toggle }}>
      {children}
    </FacesContext.Provider>
  )
}

export function useFacesEnabled() {
  const ctx = useContext(FacesContext)
  if (!ctx) {
    throw new Error('useFacesEnabled must be used within FacesProvider')
  }
  return ctx
}

export function FacesToggle() {
  const { enabled, toggle } = useFacesEnabled()

  return (
    <button
      type="button"
      className="faces-toggle"
      onClick={toggle}
      aria-pressed={!enabled}
      aria-label={enabled ? 'Switch to Serious mode' : 'Switch to Fun mode'}
    >
      {enabled ? 'Serious mode' : 'Fun mode'}
    </button>
  )
}
