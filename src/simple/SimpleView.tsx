import { certifications, events, experience, profiles, projects, site } from '../data/content'
import { domains } from '../data/skills'
import EmailReveal from '../ui/EmailReveal'
import ProjectCard from '../ui/ProjectCard'
import './simple.css'

const NAV = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['experience', 'Experience'],
  ['events', 'Hackathons'],
  ['certifications', 'Certifications'],
  ['contact', 'Contact'],
] as const

const projectName = new Map(projects.map((p) => [p.slug, p.name]))
const expName = new Map(experience.map((e) => [e.id, e.role]))
const domainId = (name: string) => 'domain-' + name.toLowerCase().replace(/\W+/g, '-')

export default function SimpleView() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#top">
          {site.name}
        </a>
        <nav aria-label="Sections">
          <ul>
            {NAV.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        <section id="top" className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">{site.name}</h1>
          <p className="hero-role">{site.role}</p>
          <p className="hero-college">
            Computer Science and Engineering · {site.college}
          </p>
        </section>

        <section id="about" className="section" aria-labelledby="about-title">
          <h2 id="about-title">About</h2>
          {site.about.map((p) => (
            <p key={p} className="lede">
              {p}
            </p>
          ))}
        </section>

        <section id="projects" className="section" aria-labelledby="projects-title">
          <h2 id="projects-title">Projects</h2>
          <p className="section-note">{projects.length} projects, newest first.</p>
          <ol className="card-grid">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <ProjectCard project={p} index={i} total={projects.length} />
              </li>
            ))}
          </ol>
        </section>

        <section id="skills" className="section" aria-labelledby="skills-title">
          <h2 id="skills-title">Skills</h2>
          <div className="skill-domains">
            {domains.map((d) => (
              <section key={d.name} className="skill-domain" aria-labelledby={domainId(d.name)}>
                <h3 id={domainId(d.name)}>{d.name}</h3>
                <dl>
                  {d.skills.map((s) => (
                    <div key={s.name} className="skill">
                      <dt>{s.name}</dt>
                      {s.projects.length > 0 && (
                        <dd>
                          Used in{' '}
                          {s.projects.length === projects.length ? (
                            <a href="#projects">all projects</a>
                          ) : (
                            s.projects.map((slug, i) => (
                              <span key={slug}>
                                {i > 0 && ', '}
                                <a href={`#project-${slug}`}>{projectName.get(slug)}</a>
                              </span>
                            ))
                          )}
                        </dd>
                      )}
                      {s.experience && (
                        <dd>
                          Applied in <a href={`#exp-${s.experience}`}>{expName.get(s.experience)}</a>
                        </dd>
                      )}
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </section>

        <section id="experience" className="section" aria-labelledby="experience-title">
          <h2 id="experience-title">Experience</h2>
          <ol className="timeline">
            {experience.map((e) => (
              <li key={e.id} id={`exp-${e.id}`}>
                <h3>{e.role}</h3>
                <p className="meta">
                  {e.org}
                  {e.date && ` · ${e.date}`}
                </p>
                {e.summary && <p>{e.summary}</p>}
              </li>
            ))}
          </ol>
        </section>

        <section id="events" className="section" aria-labelledby="events-title">
          <h2 id="events-title">Hackathons and events</h2>
          <ul className="list-cards">
            {events.map((e) => (
              <li key={e.name}>
                <h3>{e.name}</h3>
                {e.facts.length > 0 && (
                  <ul className="facts">
                    {e.facts.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section id="certifications" className="section" aria-labelledby="certs-title">
          <h2 id="certs-title">Certifications</h2>
          <ul className="list-cards">
            {certifications.map((c) => (
              <li key={c.name}>
                <h3>{c.name}</h3>
                {c.detail && <p className="meta">{c.detail}</p>}
              </li>
            ))}
          </ul>
        </section>

        <section id="contact" className="section" aria-labelledby="contact-title">
          <h2 id="contact-title">Contact</h2>
          <EmailReveal />
          <h3>Find me online</h3>
          <ul className="profiles">
            {profiles.map((p) => (
              <li key={p.id}>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.label}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                  <span aria-hidden="true"> ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
      </footer>
    </>
  )
}
