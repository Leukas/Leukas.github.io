import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
} from 'react-router-dom'
import { FacesProvider } from './components/FacesPreference'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { CV } from './pages/CV'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'

/** Preserve old Jekyll URLs like /about/ and /cv/. */
function StripTrailingSlash() {
  const { pathname, search, hash } = useLocation()
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return (
      <Navigate to={`${pathname.replace(/\/+$/, '')}${search}${hash}`} replace />
    )
  }
  return <Layout />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <StripTrailingSlash />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'cv', element: <CV /> },
      { path: 'news', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return (
    <FacesProvider>
      <RouterProvider router={router} />
    </FacesProvider>
  )
}
