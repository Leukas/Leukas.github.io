import { NavLink, Outlet } from 'react-router-dom'
import { site } from '../data/site'
import { FacesToggle, useFacesEnabled } from './FacesPreference'
import { HexGridBackground } from './HexGridBackground'

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link'

export function Layout() {
  const { enabled: funMode } = useFacesEnabled()

  return (
    <div className={funMode ? 'site site-disco' : 'site'}>
      <HexGridBackground />
      <header className="site-header">
        <div className="wrapper">
          <div className="site-brand">
            <NavLink className="site-title" to="/">
              {site.title}
            </NavLink>
            <FacesToggle />
          </div>
          <nav className="site-nav">
            <NavLink to="/about" className={navClass}>
              About Me
            </NavLink>
            <NavLink to="/cv" className={navClass}>
              My CV
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="page-content">
        <div className="wrapper">
          <Outlet />
        </div>
      </main>

      <footer className="site-footer">
        <div className="wrapper">
          <div className="footer-col-wrapper">
            <div className="footer-col">
              <ul className="contact-list">
                <li>{site.title}</li>
                <li>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <ul className="social-media-list">
                <li>
                  <a
                    className="social-link"
                    href={`https://github.com/${site.github}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`GitHub @${site.github}`}
                  >
                    <svg
                      className="social-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    className="social-link"
                    href={`https://twitter.com/${site.twitter}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`Twitter @${site.twitter}`}
                  >
                    <svg
                      className="social-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.727-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    className="social-link"
                    href={`https://bsky.app/profile/${site.bluesky}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`Bluesky @${site.bluesky}`}
                  >
                    <svg
                      className="social-icon"
                      viewBox="0 0 568 501"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M123.121 33.6637C188.241 82.5526 258.281 181.681 284 234.873C309.719 181.681 379.759 82.5526 444.879 33.6637C491.866 -1.61183 568 -28.9064 568 57.9464C568 75.2916 558.055 203.659 552.222 224.501C531.947 296.954 458.067 315.434 392.347 304.249C507.222 323.8 536.444 388.56 473.333 453.32C353.473 576.312 301.061 422.461 287.631 383.039C285.169 375.812 284.017 372.431 284 375.306C283.983 372.431 282.831 375.812 280.369 383.039C266.939 422.461 214.527 576.312 94.6667 453.32C31.5556 388.56 60.7778 323.8 175.653 304.249C109.933 315.434 36.0535 296.954 15.7778 224.501C9.94525 203.659 0 75.2916 0 57.9464C0 -28.9064 76.1345 -1.61183 123.121 33.6637Z"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    className="social-link"
                    href={`https://scholar.google.com/citations?user=${site.scholar}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label="Google Scholar profile"
                  >
                    <svg
                      className="social-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    className="social-link"
                    href={`https://www.linkedin.com/in/${site.linkedin}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label="LinkedIn profile"
                  >
                    <svg
                      className="social-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-col footer-desc">
              <p>{site.description}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
