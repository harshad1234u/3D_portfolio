import type { ReactNode } from 'react'
import type { Category, Project } from '../data/content'

// Generated cover used until a real screenshot exists at public/projects/<slug>.png.
const GRADIENT: Record<Category, string> = {
  ai: 'linear-gradient(135deg, #7c6baf, #f2a3a0)',
  security: 'linear-gradient(135deg, #1e1b4b, #7c6baf)',
  web: 'linear-gradient(135deg, #d9774f, #ffc9a3)',
  systems: 'linear-gradient(135deg, #1b1a2e, #9db59a)',
}

const MOTIF: Record<Category, ReactNode> = {
  // orbiting nodes
  ai: (
    <>
      <circle cx="50" cy="50" r="18" />
      <circle cx="50" cy="50" r="32" />
      <circle cx="50" cy="50" r="46" />
      <circle cx="82" cy="50" r="4" fill="currentColor" />
      <circle cx="27" cy="27" r="3" fill="currentColor" />
      <circle cx="50" cy="96" r="3.5" fill="currentColor" />
    </>
  ),
  // keyhole arch
  security: (
    <>
      <path d="M20 95V45a30 30 0 0 1 60 0v50" />
      <path d="M32 95V47a18 18 0 0 1 36 0v48" />
      <circle cx="50" cy="56" r="6" />
      <path d="M50 62v14" />
    </>
  ),
  // layered windows
  web: (
    <>
      <rect x="10" y="20" width="60" height="44" rx="4" />
      <rect x="22" y="32" width="60" height="44" rx="4" />
      <rect x="34" y="44" width="60" height="44" rx="4" />
      <path d="M34 54h60" />
    </>
  ),
  // stacked blocks
  systems: (
    <>
      <rect x="10" y="60" width="26" height="26" />
      <rect x="40" y="60" width="26" height="26" />
      <rect x="70" y="60" width="26" height="26" />
      <rect x="25" y="30" width="26" height="26" />
      <rect x="55" y="30" width="26" height="26" />
      <rect x="40" y="0" width="26" height="26" />
    </>
  ),
}

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

export default function ProjectCover({ project }: { project: Project }) {
  const h = hash(project.slug)
  return (
    <div className="cover" style={{ background: GRADIENT[project.category] }} aria-hidden="true">
      <svg
        className="cover-motif"
        viewBox="0 0 100 100"
        style={{ transform: `rotate(${(h % 40) - 20}deg) translate(${(h % 13) - 6}%, ${(h % 9) - 4}%)` }}
      >
        {MOTIF[project.category]}
      </svg>
      <span className="cover-name">{project.name}</span>
    </div>
  )
}
