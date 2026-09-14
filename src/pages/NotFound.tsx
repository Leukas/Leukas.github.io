import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>
        <strong>Page not found :(</strong>
      </p>
      <p>The requested page could not be found.</p>
      <p>
        <Link to="/">Back home</Link>
      </p>
    </div>
  )
}
