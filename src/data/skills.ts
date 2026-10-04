import { experience, projects } from './content'

// Skill → projects. Explicit lists, reviewed against the brief's tech lists and DECISIONS.md §4.
export type Skill = { name: string; projects: string[]; experience?: string }
export type Domain = { name: string; skills: Skill[] }

const ALL = projects.map((p) => p.slug)

export const domains: Domain[] = [
  {
    name: 'Languages',
    skills: [
      {
        name: 'Python',
        // Projects tagged Python, or built on Python stacks (FastAPI, Streamlit, Flask, TensorFlow, Tkinter), plus CivoAI.
        projects: [
          'civicinsight-ai', 'lexguard-ai', 'civoai', 'cifake', 'carboniq', 'phishcatch-kiosk', 'ai-quiz-app',
          'facial-emotion-recognition', 'sentinelai-soc', 'face-attendance-system', 'network-scanner',
          'food-ordering-ai-bot', 'hospital-management-system', 'tetris-game',
        ],
      },
      { name: 'Java', projects: ['student-attendance-alert-system'] },
      { name: 'C', projects: ['workforce-management-system'] },
      { name: 'SQL', projects: ['carboniq', 'ai-quiz-app', 'food-ordering-ai-bot', 'hospital-management-system'] },
      { name: 'TypeScript', projects: ['civicinsight-ai'] },
    ],
  },
  {
    name: 'AI / ML',
    skills: [
      {
        name: 'Generative AI',
        projects: ['civicinsight-ai', 'lexguard-ai', 'civoai', 'carboniq', 'phishcatch-kiosk', 'ai-quiz-app'],
      },
      {
        name: 'LLMs (Gemini, NVIDIA NIM)',
        projects: ['civicinsight-ai', 'lexguard-ai', 'civoai', 'carboniq', 'phishcatch-kiosk', 'ai-quiz-app'],
      },
      { name: 'Prompt engineering', projects: [], experience: 'xtragrad' },
      { name: 'TensorFlow / Keras', projects: ['cifake', 'facial-emotion-recognition'] },
      { name: 'CNNs', projects: ['cifake', 'facial-emotion-recognition'] },
      { name: 'OpenCV', projects: ['facial-emotion-recognition', 'face-attendance-system'] },
    ],
  },
  {
    name: 'Backend & Web',
    skills: [
      { name: 'FastAPI', projects: ['civicinsight-ai', 'lexguard-ai', 'carboniq'] },
      { name: 'React', projects: ['civicinsight-ai', 'lexguard-ai', 'carboniq'] },
      { name: 'Vite', projects: ['civicinsight-ai', 'lexguard-ai', 'carboniq'] },
      { name: 'Streamlit', projects: ['cifake', 'phishcatch-kiosk', 'ai-quiz-app'] },
      { name: 'Flask', projects: ['food-ordering-ai-bot'] },
    ],
  },
  {
    name: 'Data',
    skills: [
      // Supabase is PostgreSQL; Firestore is Firebase.
      { name: 'PostgreSQL', projects: ['carboniq', 'ai-quiz-app'] },
      { name: 'MySQL', projects: ['food-ordering-ai-bot', 'hospital-management-system'] },
      { name: 'Firebase', projects: ['phishcatch-kiosk'] },
    ],
  },
  {
    name: 'Security',
    skills: [
      { name: 'Prompt-injection resistance', projects: ['lexguard-ai'] },
      { name: 'Phishing and scam detection', projects: ['phishcatch-kiosk', 'civicinsight-ai'] },
      { name: 'Log analysis', projects: [], experience: 'deloitte' },
    ],
  },
  {
    name: 'Tools',
    skills: [
      { name: 'Git', projects: ALL },
      { name: 'GitHub', projects: ALL },
      { name: 'Pytest', projects: ['carboniq'] },
      { name: 'Docker', projects: ['carboniq'] },
      { name: 'Linux', projects: [] },
    ],
  },
]

// Fail fast on a typo'd slug or experience id.
const slugs = new Set(ALL)
const expIds = new Set(experience.map((e) => e.id))
for (const d of domains)
  for (const s of d.skills) {
    for (const p of s.projects) if (!slugs.has(p)) throw new Error(`skills: unknown project "${p}" in ${s.name}`)
    if (s.experience && !expIds.has(s.experience))
      throw new Error(`skills: unknown experience "${s.experience}" in ${s.name}`)
  }
