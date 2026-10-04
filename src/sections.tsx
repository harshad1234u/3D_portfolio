import type { ReactNode } from 'react'
import { certifications, events, experience, profiles, projects, site } from './data/content'
import { domains } from './data/skills'
import EmailReveal from './ui/EmailReveal'
import ProjectCard from './ui/ProjectCard'

// Section content shared by the Simple view and the 3D world overlay.

const projectName = new Map(projects.map((p) => [p.slug, p.name]))
const expName = new Map(experience.map((e) => [e.id, e.role]))
const domainId = (name: string) => 'domain-' + name.toLowerCase().replace(/\W+/g, '-')

export type SectionDef = { id: string; nav?: string; title: string; body: () => ReactNode }

export const SECTIONS: SectionDef[] = [
  {
    id: 'top',
    title: site.name,
    body: () => (
      <div className="hero-card">
        <h1 id="top-title">{site.name}</h1>
        <p className="hero-role">{site.role}</p>
        <p className="hero-college">Computer Science and Engineering · {site.college}</p>
      </div>
    ),
  },
  {
    id: 'about',
    nav: 'About',
    title: 'About',
    body: () => site.about.map((p) => <p key={p} className="lede">{p}</p>),
  },
  {
    id: 'projects',
    nav: 'Projects',
    title: 'Projects',
    body: () => (
      <>
        <p className="section-note">{projects.length} projects, newest first.</p>
        <ol className="card-grid">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard project={p} index={i} total={projects.length} />
            </li>
          ))}
        </ol>
      </>
    ),
  },
  {
    id: 'skills',
    nav: 'Skills',
    title: 'Skills',
    body: () => (
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
    ),
  },
  {
    id: 'experience',
    nav: 'Experience',
    title: 'Experience',
    body: () => (
      <ol className="timeline">
        {experience.map((e) => (
          <li key={e.id} id={`exp-${e.id}`}>
            <h3>{e.role}</h3>
            <p className="meta">
              {e.org}
              {e.date && (
                <>
                  {' · '}
                  <span className="mono">{e.date}</span>
                </>
              )}
            </p>
            {e.summary && <p>{e.summary}</p>}
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: 'events',
    nav: 'Hackathons',
    title: 'Hackathons and events',
    body: () => (
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
    ),
  },
  {
    id: 'certifications',
    nav: 'Certifications',
    title: 'Certifications',
    body: () => (
      <ul className="list-cards">
        {certifications.map((c) => (
          <li key={c.name}>
            <h3>{c.name}</h3>
            {c.detail && <p className="meta">{c.detail}</p>}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'contact',
    nav: 'Contact',
    title: 'Contact',
    body: () => (
      <>
        <EmailReveal />
        <h3 className="contact-sub">Find me online</h3>
        <ul className="profiles">
          {profiles.map((p) => (
            <li key={p.id}>
              <a className="btn-outline" href={p.url} target="_blank" rel="noopener noreferrer">
                {p.label}
                <span className="visually-hidden"> (opens in a new tab)</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
        </ul>
      </>
    ),
  },
]

// Renders one section; the hero carries the page's only <h1>, others get an <h2>.
export function Section({ def, className }: { def: SectionDef; className: string }) {
  const hero = def.id === 'top'
  return (
    <section id={def.id} className={className} aria-labelledby={`${def.id}-title`} tabIndex={-1}>
      {!hero && (
        <>
          <span className="eyebrow mono" aria-hidden="true">
            {String(SECTIONS.indexOf(def)).padStart(2, '0')}
          </span>
          <h2 id={`${def.id}-title`}>{def.title}</h2>
        </>
      )}
      {def.body()}
    </section>
  )
}
