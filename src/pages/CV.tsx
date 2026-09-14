import { useState, type ReactNode } from 'react'

function Pub({
  authors,
  title,
  href,
  venue,
  note,
}: {
  authors: ReactNode
  title: string
  href?: string
  venue: string
  note?: string
}) {
  return (
    <li>
      {authors}.{' '}
      {href ? (
        <a href={href} rel="noopener noreferrer" target="_blank">
          {title}
        </a>
      ) : (
        title
      )}
      , <em>{venue}</em>
      {note ? (
        <ul>
          <li>{note}</li>
        </ul>
      ) : null}
    </li>
  )
}

const Me = () => <strong>Lukas Edman</strong>

function Expandable({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <details className="experience">
      <summary className="experience-summary">
        <span className="experience-title">{title}</span>
      </summary>
      <div className="experience-body">{children}</div>
    </details>
  )
}

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <details
      className="section-fold"
      open={open}
      onToggle={(event) => {
        setOpen(event.currentTarget.open)
      }}
    >
      <summary className="section-fold-summary">
        <h2>{title}</h2>
      </summary>
      <div className="section-fold-body">{children}</div>
    </details>
  )
}

export function CV() {
  return (
    <>
      <aside className="cv-peeker cv-peeker-left" aria-hidden="true">
        <img src="/me_body.png" alt="" draggable={false} />
      </aside>
      <aside className="cv-peeker cv-peeker-right" aria-hidden="true">
        <img src="/me_body.png" alt="" draggable={false} />
      </aside>
      <article className="post cv-page">
      <header className="post-header">
        <h1 className="post-title">My CV</h1>
      </header>
      <div className="post-content">
        <h4>Contact Details</h4>
        <p>
          Feel free to email me (address below) if you need more than just my
          email.
        </p>

        <Section title="Education" defaultOpen>
          <Expandable title="Post-Doc, 2024–">
          <p>
            <em>LMU Munich</em>, 2024; <em>TU Munich</em>, 2025–
          </p>
          <ul>
            <li>Research topics: Low-Resource NLP, Tokenization</li>
            <li>Advisor: Prof. Alexander Fraser</li>
          </ul>
        </Expandable>

        <Expandable title="PhD Computational Linguistics, 2019–2023">
          <p>
            <em>University of Groningen</em>
          </p>
          <ul>
            <li>
              Thesis:{' '}
              <a
                href="https://research.rug.nl/en/publications/the-little-data-that-could-making-the-most-of-low-resource-natura"
                rel="noopener noreferrer"
                target="_blank"
              >
                The Little Data That Could: Making the Most of Low-Resource
                Natural Language Processing
              </a>
            </li>
            <li>Advisors: Dr. Antonio Toral, Prof. Gertjan van Noord</li>
          </ul>
        </Expandable>

        <Expandable title="MSc Artificial Intelligence, 2017–2019">
          <p>
            <em>University of Groningen</em>
          </p>
          <ul>
            <li>
              Master&apos;s thesis on unsupervised neural machine translation
              under advisors Dr. Antonio Toral and Dr. Jennifer Spenader
            </li>
          </ul>
        </Expandable>

        <Expandable title="BSc Computer Science, 2016–2017">
          <p>
            <em>Indiana University</em>
          </p>
          <ul>
            <li>Graduated with Highest Honors with a 3.97/4.0 GPA</li>
          </ul>
        </Expandable>

        <Expandable title="Computer Science Major, 2012–2016">
          <p>
            <em>University of Puget Sound</em>
          </p>
          <ul>
            <li>
              Bachelor&apos;s project on automatic reference-finding in the Latin
              Vulgate
            </li>
          </ul>
        </Expandable>

        </Section>

        <Section title="Publications" defaultOpen>
        <p>
          <a
            href="https://scholar.google.com/citations?user=DyA2BwUAAAAJ"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Scholar
          </a>
        </p>
        <ul>
          <Pub
            authors={
              <>
                <Me /> and Alexander Fraser
              </>
            }
            title="Toppling the Hierarchy in Byte-level Language Modeling"
            href="https://arxiv.org/abs/2609.00463"
            venue="Findings of the Association for Computational Linguistics: EMNLP 2026. 2026."
          />
          <Pub
            authors={
              <>
                <Me />, Daryna Dementieva, and Alexander Fraser
              </>
            }
            title="From Specialization to Generalization: Instruction-tuned LLMs for Robust Harmful Content Mitigation"
            href="https://arxiv.org/abs/2608.25605"
            venue="Proceedings of the Association for Computational Linguistics: EMNLP 2026. 2026."
          />
          <Pub
            authors={
              <>
                <Me />, Helmut Schmid, and Alexander Fraser
              </>
            }
            title="EXECUTE: A Multilingual Benchmark for LLM Token Understanding"
            href="https://arxiv.org/abs/2505.17784"
            venue="Findings of the Conference of the Association for Computational Linguistics: ACL 2025. 2025."
          />
          <Pub
            authors={
              <>
                Lukas Kinder, <Me />, Alexander Fraser, and Tobias Käfer
              </>
            }
            title="Positional Overload: Positional Debiasing and Context Window Extension for Large Language Models using Set Encoding"
            href="https://aclanthology.org/2025.acl-long.197/"
            venue="Proceedings of the Conference of the Association for Computational Linguistics: ACL 2025. 2025."
          />
          <Pub
            authors={
              <>
                <Me /> and Alexander Fraser
              </>
            }
            title="Mask and You Shall Receive: Optimizing Masked Language Modeling For Pretraining BabyLMs"
            href="https://aclanthology.org/2025.babylm-main.31/"
            venue="Proceedings of the First BabyLM Workshop. 2025."
            note="Achieved first place in strict-small track."
          />
          <Pub
            authors={
              <>
                <Me />, Lisa Bylinina, Faeze Ghorbanpour, and Alexander Fraser
              </>
            }
            title="Are BabyLMs Second Language Learners?"
            href="https://aclanthology.org/2024.conll-babylm.14/"
            venue="Proceedings of the BabyLM Challenge at the 28th Conference on Computational Natural Language Learning. 2024."
          />
          <Pub
            authors={
              <>
                <Me />, Helmut Schmid, and Alexander Fraser
              </>
            }
            title="CUTE: Measuring LLMs’ Understanding of Their Tokens"
            href="https://arxiv.org/abs/2409.15452"
            venue="Proceedings of the Association for Computational Linguistics: EMNLP 2024. 2024."
          />
          <Pub
            authors={
              <>
                <Me />, Gabriele Sarti, Antonio Toral, Gertjan van Noord, and
                Arianna Bisazza
              </>
            }
            title="Are Character-level Translations Worth the Wait? Comparing ByT5 and mT5 for Machine Translation"
            href="https://doi.org/10.1162/tacl_a_00651"
            venue="Transactions of the Association for Computational Linguistics: TACL 2024. 2024."
          />
          <Pub
            authors={
              <>
                <Me />, Lisa Bylinina
              </>
            }
            title="Too Much Information: Keeping Training Simple for BabyLMs"
            href="https://arxiv.org/abs/2311.01955"
            venue="Proceedings of the BabyLM Challenge at the 27th Conference on Computational Natural Language Learning. 2023."
          />
          <Pub
            authors={
              <>
                Konstantin Chernyshev, Ekaterina Garanina, Duygu Bayram, Qiankun
                Zheng, and <Me />
              </>
            }
            title="LCT-1 at SemEval-2023 Task 10: Pre-training and Multi-task Learning for Sexism Detection and Classification"
            href="https://aclanthology.org/2023.semeval-1.217/"
            venue="Proceedings of the 17th International Workshop on Semantic Evaluation (SemEval-2023). 2023."
          />
          <Pub
            authors={
              <>
                <Me />, Antonio Toral, and Gertjan van Noord
              </>
            }
            title="Subword-Delimited Downsampling for Better Character-Level Translation"
            href="https://arxiv.org/pdf/2212.01304.pdf"
            venue="Findings of the Association for Computational Linguistics: EMNLP 2022. 2022."
          />
          <Pub
            authors={
              <>
                <Me />, Antonio Toral, and Gertjan van Noord
              </>
            }
            title="Patching Leaks in the Charformer for Efficient Character-Level Generation"
            href="https://arxiv.org/pdf/2205.14086.pdf"
            venue="arXiv preprint arXiv:2205.14086. 2022."
          />
          <Pub
            authors={
              <>
                <Me />, Antonio Toral, and Gertjan van Noord
              </>
            }
            title="The Importance of Context in Very Low Resource Language Modeling"
            href="https://arxiv.org/pdf/2205.04810.pdf"
            venue="18th International Conference on Natural Language Processing (ICON2021). 2021."
          />
          <Pub
            authors={
              <>
                <Me />, Ahmet Üstün, Antonio Toral, and Gertjan van Noord
              </>
            }
            title="Unsupervised Translation of German–Lower Sorbian: Exploring Training and Novel Transfer Methods on a Low-Resource Language"
            href="https://arxiv.org/pdf/2109.12012.pdf"
            venue="EMNLP 2021 Sixth Conference on Machine Translation (WMT21). 2021."
            note="Achieved first place for Lower Sorbian→German translation."
          />
          <Pub
            authors={
              <>
                <Me />, Antonio Toral, and Gertjan van Noord
              </>
            }
            title="Low-Resource Unsupervised NMT: Diagnosing the Problem and Providing a Linguistically Motivated Solution"
            href="https://aclanthology.org/2020.eamt-1.10.pdf"
            venue="The 22nd Annual Conference of the European Association for Machine Translation (EAMT2020). 2020."
          />
          <Pub
            authors={
              <>
                <Me />, Antonio Toral, and Gertjan van Noord
              </>
            }
            title="Data Selection for Unsupervised Translation of German–Upper Sorbian"
            href="https://aclanthology.org/2020.wmt-1.130.pdf"
            venue="EMNLP 2020 Fifth Conference on Machine Translation (WMT20). 2020."
          />
          <Pub
            authors={
              <>
                Christian Roest, <Me />, Gosse Minnema, Kevin Kelly, Jennifer
                Spenader and Antonio Toral
              </>
            }
            title="Machine Translation for English–Inuktitut with Segmentation, Data Acquisition and Pre-Training"
            href="https://aclanthology.org/2020.wmt-1.29.pdf"
            venue="EMNLP 2020 Fifth Conference on Machine Translation (WMT20). 2020."
          />
          <Pub
            authors={
              <>
                Antonio Toral, <Me />, Galiya Yeshmagambetova, and Jennifer
                Spenader
              </>
            }
            title="Neural Machine Translation for English–Kazakh with Morphological Segmentation and Synthetic Data"
            href="https://aclanthology.org/W19-5343.pdf"
            venue="ACL 2019 Fourth Conference on Machine Translation (WMT19). 2019."
            note="Achieved first place for English→Kazakh translation."
          />
        </ul>
        </Section>

        <Section title="Work Experience" defaultOpen>
        <Expandable title="Instructor, 2017–2023, 2025–">
          <p>
            <em>TU Munich</em>, 2025–
          </p>
          <ul>
            <li>Gave various lectures in the area of NLP</li>
            <li>Designed courses for students</li>
            <li>Supervised groups of students for project courses</li>
          </ul>
          <p>
            <em>University of Groningen</em>, 2017–2023
          </p>
          <ul>
            <li>
              Gave various lectures on Machine Learning, NLP, Computer Vision,
              and Audio Processing
            </li>
            <li>Supervised students on projects for SemEval shared tasks</li>
            <li>Led tutorial and computer lab sessions</li>
            <li>Wrote and graded coursework</li>
            <li>Invigilated and graded exams</li>
            <li>
              Courses taught (Master):
              <ul>
                <li>Shared Task Information Science, 2022–23</li>
              </ul>
            </li>
            <li>
              Courses taught (Bachelor):
              <ul>
                <li>Introduction to Machine Learning, 2022–23</li>
                <li>Machine Learning Project, 2021–22</li>
              </ul>
            </li>
            <li>
              Courses assisted (Master):
              <ul>
                <li>Shared Task Information Science, 2020–22</li>
                <li>Language Technology Project, 2020–22</li>
                <li>Natural Language Processing, 2018–19</li>
                <li>Pattern Recognition, 2018–19</li>
              </ul>
            </li>
            <li>
              Courses assisted (Bachelor):
              <ul>
                <li>Machine Learning Project, 2020–21</li>
                <li>Advanced Algorithms and Data Structures, 2018–19</li>
                <li>Artificial Intelligence I, 2017–19</li>
              </ul>
            </li>
          </ul>
        </Expandable>

        <Expandable title="Thesis Supervisor, 2020–2023, 2025–">
          <p>
            <em>TU Munich</em> 2025–
          </p>
          <ul>
            <li>Supervised Master&apos;s students on their thesis projects.</li>
            <li>
              Project on translation of Azerbaijani to English with prompt
              tuning.
            </li>
            <li>Project on distillation of Turkic translation models.</li>
            <li>
              Project on song translation, preserving meaning, syllable count,
              rhyming.
            </li>
            <li>Project on translation of Korean to Jejueo.</li>
          </ul>
          <p>
            <em>University of Groningen</em>, 2020–2023
          </p>
          <ul>
            <li>Supervised Master&apos;s students on their thesis projects.</li>
            <li>
              Project on translation of Dutch–Gronings and other Lower Saxon
              dialects.
            </li>
            <li>Project on unsupervised NMT for English–Chinese.</li>
          </ul>
        </Expandable>

        <Expandable title="Area Chair, 2025–">
          <ul>
            <li>
              Area Chair for <em>*ACL</em> conferences.
            </li>
          </ul>
        </Expandable>

        <Expandable title="Reviewer, 2019–">
          <ul>
            <li>
              Reviewer for <em>*ACL</em> conferences and affiliated workshops.
            </li>
          </ul>
        </Expandable>

        </Section>

        <Section title="Technical Skills">
          <p>Do you really care? We&apos;re all vibe coding now.</p>
        </Section>
      </div>
    </article>
    </>
  )
}
