import { useState } from 'react'
import type { Project } from '../data/content'
import ProjectCover from './ProjectCover'

export default function ProjectCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const [shot, setShot] = useState(true)
  return (
    <article className="card" id={`project-${project.slug}`} aria-labelledby={`project-${project.slug}-title`}>
      <div className="card-media">
        <ProjectCover project={project} />
        {shot && (
          <img
            src={`${import.meta.env.BASE_URL}projects/${project.slug}.png`}
            alt={`Screenshot of ${project.name}`}
            loading="lazy"
            decoding="async"
            width={1600}
            height={1000}
            onError={() => setShot(false)}
          />
        )}
      </div>
      <div className="card-body">
        <p className="card-index">
          {String(index + 1).padStart(2, '0')} / {total}
        </p>
        <h3 id={`project-${project.slug}-title`}>{project.name}</h3>
        <p>{project.description}</p>
        <ul className="tags" aria-label="Technologies">
          {project.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {project.repo && (
          <a className="card-link" href={project.repo} target="_blank" rel="noopener noreferrer">
            View code<span className="visually-hidden"> for {project.name} on GitHub (opens in a new tab)</span>
            <span aria-hidden="true"> ↗</span>
          </a>
        )}
      </div>
    </article>
  )
}
