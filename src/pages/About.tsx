import { site } from '../data/site'
import { PoppingFaces } from '../components/PoppingFaces'

export function About() {
  return (
    <>
      <PoppingFaces />
      <article className="post about-page">
        <header className="post-header">
          <h1 className="post-title">About Me</h1>
        </header>
        <div className="post-content about-content">
          <img
            className="avatar"
            src={site.avatar}
            alt="Avatar of Lukas Edman"
          />
          <p>
            I am currently a post-doc at TU Munich, researching various topics,
            including character-level NLP, low-resource pretraining, and machine
            translation. My most recent work has been on benchmarking LLMs&apos;
            understanding of the characters in their tokens, which is surprisingly
            lacking. I believe that although everyone uses BPE and it is quite
            powerful, it is not the way forward in the long run.
          </p>
          <p>
            I am also quite interested in efficiency methods for making training
            large models more feasible for everyone, not just big tech companies.
            In that front I&apos;ve participated in the BabyLM Challenge in
            2023-2025, and currently in 2026. Humans clearly learn more
            efficiently from the &quot;training data&quot; we encounter, but on
            the other hand it takes us years to develop fluency in a language,
            whereas we are training LLMs in a matter of months. Is there a best of
            both worlds? That&apos;s what I&apos;d like to find out.
          </p>
          <p>
            Generally speaking, I am interested in the similarities and
            differences between machine learning and human learning. I believe
            there is much we can learn and incorporate from our own brains into ML
            models. For instance, as we sleep, we are consolidating information,
            reinforcing things we learned that day, finding ways to recycle neural
            pathways for other purposes, and more. This is all done without direct
            access to any input, but ML models currently use input from real-world
            data to learn. How we can incorporate more of the brain&apos;s
            learning strategies into ML models is something I hope we can learn.
          </p>
        </div>
      </article>
    </>
  )
}
