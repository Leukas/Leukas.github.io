import { Link } from 'react-router-dom'
import { BouncingFace } from '../components/BouncingFace'
import { useFacesEnabled } from '../components/FacesPreference'

type NewsItem = {
  date: string
  title: string
  href?: string
  outlet?: string
  interview?: boolean
  upcoming?: boolean
  /** Text before the title (e.g. "Released"). */
  prefix?: string
  /** Rendered after title when present (e.g. venue), in bold. */
  emphasis?: string
  /** Text after the emphasis (e.g. ranking details). */
  suffix?: string
}

const news: NewsItem[] = [
  {
    date: 'Upcoming',
    outlet: 't3n',
    title: '',
    interview: true,
    upcoming: true,
  },
  {
    date: '18 Sep 2026',
    outlet: 'Forschung & Lehre',
    title:
      '„Wie können wir LLMs genauso effizient trainieren wie Menschen?“',
    href: 'https://www.forschung-und-lehre.de/forschung/wie-koennen-wir-llms-genauso-effizient-trainieren-wie-menschen-7909',
    interview: true,
  },
  {
    date: '17 Sep 2026',
    prefix: 'Released',
    title: 'What LLMs Can(not) Do',
    href: 'https://what-llms-can-not-do.github.io/',
  },
  {
    date: '27 Aug 2026',
    title: 'Joined the BabyLM Organizing Committee',
  },
  {
    date: '27 Aug 2026',
    title: '5 papers',
    emphasis: 'BabyLM Challenge 2026',
    suffix:
      ', including 1st-ranked Multilingual and Strict track and 2nd-ranked Strict-Small track submissions',
  },
  {
    date: '21 Aug 2026',
    title: 'Toppling the Hierarchy in Byte-level Language Modeling',
    emphasis: 'EMNLP 2026 (Findings)',
    href: 'https://arxiv.org/abs/2609.00463',
  },
  {
    date: '21 Aug 2026',
    title:
      'From Specialization to Generalization: Instruction-tuned LLMs for Robust Harmful Content Mitigation',
    emphasis: 'EMNLP 2026 (Main)',
    href: 'https://arxiv.org/abs/2608.25605',
  },
  {
    date: '16 Feb 2026',
    outlet: 'Mindshift Online',
    title: 'When Language Models Learn Like Babies',
    href: 'https://chn.tum.de/stories/news/news-detail/when-language-models-learn-like-babies',
    interview: true,
  },
]

function NewsTitle({ item }: { item: NewsItem }) {
  if (!item.title && !item.emphasis) return null

  const title = item.href ? (
    <a href={item.href} rel="noopener noreferrer" target="_blank">
      {item.title}
    </a>
  ) : (
    item.title
  )

  return (
    <span className={item.upcoming ? 'news-upcoming' : undefined}>
      {item.prefix ? <>{item.prefix} </> : null}
      {title}
      {item.emphasis ? (
        <>
          {' '}
          accepted to <strong>{item.emphasis}</strong>
        </>
      ) : null}
      {item.suffix ?? null}
    </span>
  )
}

export function Home() {
  const { enabled: facesEnabled } = useFacesEnabled()

  return (
    <>
      {facesEnabled ? <BouncingFace /> : null}
      <article className="post home">
        <div className="post-content">
          <p>
            Welcome to my website. Take a look at my{' '}
            <Link to="/about">About Me</Link> for a description of my research
            interests and goals, or my <Link to="/cv">CV</Link> for, well, my
            CV.
          </p>
          <h2>News</h2>
          <ul className="news-list">
            {news.map((item, index) => (
              <li
                key={`${item.date}-${item.title || item.outlet}-${index}`}
                className="news-item"
              >
                <time className="news-date">{item.date}</time>
                <div className="news-body">
                  {item.interview && item.outlet ? (
                    <span className="news-outlet">
                      Interview with <strong>{item.outlet}</strong>
                    </span>
                  ) : null}
                  <NewsTitle item={item} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </>
  )
}
