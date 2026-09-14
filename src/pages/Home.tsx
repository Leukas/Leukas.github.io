import { Link } from 'react-router-dom'
import { BouncingFace } from '../components/BouncingFace'

export function Home() {
  return (
    <>
      <BouncingFace />
      <article className="post home">
        <div className="post-content">
          <p>
            Welcome to my website. Take a look at my{' '}
            <Link to="/about">About Me</Link> for a description of my research
            interests and goals, or at my <Link to="/cv">CV</Link> for, well, my
            CV.
          </p>
        </div>
      </article>
    </>
  )
}
