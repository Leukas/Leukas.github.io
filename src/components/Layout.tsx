import { NavLink, Outlet } from 'react-router-dom'
import { site } from '../data/site'

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link'

export function Layout() {
  return (
    <div className="site">
      <header className="site-header">
        <div className="wrapper">
          <NavLink className="site-title" to="/">
            {site.title}
          </NavLink>
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
                    href={`https://github.com/${site.github}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="username">@{site.github}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`https://twitter.com/${site.twitter}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="username">@{site.twitter}</span>
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
