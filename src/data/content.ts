// Single source of site copy. Only facts from the approved brief and DECISIONS.md.

export const site = {
  name: 'Harshad R',
  role: 'Aspiring AI, cybersecurity and full-stack developer',
  college: 'K. Ramakrishnan College of Technology',
  about: [
    'I’m Harshad R, a third-year Computer Science and Engineering student at K. Ramakrishnan College of Technology.',
    'I’m an aspiring AI, cybersecurity and full-stack developer.',
  ],
}

// Stored reversed and split so the address never appears as plain text in the HTML or bundle.
const EMAIL_PARTS = ['moc.', 'liamg', '@02', 'ibma', 'dahsrah']
export const getEmail = () => EMAIL_PARTS.join('').split('').reverse().join('')

export type Category = 'ai' | 'security' | 'web' | 'systems'

export type Project = {
  slug: string
  name: string
  description: string
  tech: string[]
  category: Category
  repo?: string
}

const GH = 'https://github.com/harshad1234u/'

// Newest first (brief order).
export const projects: Project[] = [
  {
    slug: 'civicinsight-ai',
    name: 'CivicInsight AI',
    description:
      'Multilingual civic platform (22 Indian languages) that verifies government schemes and flags scams; 284 backend and 143 frontend tests.',
    tech: ['FastAPI', 'React', 'TypeScript', 'NVIDIA NIM'],
    category: 'web',
    repo: GH + 'CivicInsight_AI',
  },
  {
    slug: 'lexguard-ai',
    name: 'LexGuard AI',
    description:
      'Legal document analyzer where every LLM finding is verified against the source; prompt-injection resistant.',
    tech: ['FastAPI', 'React', 'Gemini', 'Nemotron'],
    category: 'ai',
  },
  {
    slug: 'civoai',
    name: 'CivoAI',
    description:
      'Pothole reporting and road-risk platform with detection, a deterministic severity and cost engine, and AI reports.',
    tech: ['Roboflow', 'Nemotron', 'Llama Vision'],
    category: 'ai',
  },
  {
    slug: 'cifake',
    name: 'CIFAKE',
    description:
      'AI-generated image and deepfake detector with 93.32% and 98.18% validation accuracy and Grad-CAM explanations.',
    tech: ['TensorFlow/Keras', 'Streamlit'],
    category: 'ai',
    repo: GH + 'CIFAKE',
  },
  {
    slug: 'carboniq',
    name: 'CarbonIQ',
    description:
      'AI carbon footprint coach with 133 Pytest cases, 90%+ coverage and Row Level Security.',
    tech: ['React', 'FastAPI', 'Supabase', 'Gemini'],
    category: 'web',
    repo: GH + 'carboniq',
  },
  {
    slug: 'phishcatch-kiosk',
    name: 'PhishCatch Kiosk',
    description: 'LLM phishing analyzer that reports a threat level and risk score, with model fallback.',
    tech: ['Streamlit', 'NVIDIA NIM', 'Firestore'],
    category: 'security',
    repo: GH + 'PhishCatch-Kiosk',
  },
  {
    slug: 'ai-quiz-app',
    name: 'AI Quiz App',
    description: 'AI-generated quizzes with analytics, a leaderboard and Google OAuth.',
    tech: ['Streamlit', 'Supabase', 'NVIDIA NIM'],
    category: 'web',
    repo: GH + 'quiz-app',
  },
  {
    slug: 'facial-emotion-recognition',
    name: 'Real-time Facial Emotion Recognition',
    description: 'Seven-emotion CNN running on TensorFlow Lite with a live webcam HUD.',
    tech: ['TensorFlow', 'OpenCV'],
    category: 'ai',
    repo: GH + 'realtime-facial-emotion-recognition',
  },
  {
    slug: 'sentinelai-soc',
    name: 'SentinelAI SOC',
    description: 'AI-powered honeypot that attracts, logs and analyzes intrusion attempts.',
    tech: ['Python', 'ML'],
    category: 'security',
    repo: GH + 'SentinelAI-SOC-AI-Powered-Honeypot',
  },
  {
    slug: 'face-attendance-system',
    name: 'Face Attendance System',
    description: 'Real-time face recognition attendance.',
    tech: ['Python', 'OpenCV'],
    category: 'ai',
    repo: GH + 'ATTENDENCE_USING_FACE',
  },
  {
    slug: 'network-scanner',
    name: 'Network Scanner',
    description: 'TCP port scanner with a GUI.',
    tech: ['Python', 'Tkinter'],
    category: 'security',
    repo: GH + 'Network_scan',
  },
  {
    slug: 'food-ordering-ai-bot',
    name: 'Online Food Ordering AI Bot',
    description: 'Flask ordering app with MySQL and an AI chatbot.',
    tech: ['Flask', 'MySQL'],
    category: 'web',
    repo: GH + 'online_Food_ordering_AIBOT',
  },
  {
    slug: 'voterflow',
    name: 'VoterFlow',
    description: 'Workflow app for voter registration.',
    tech: ['JavaScript'],
    category: 'web',
    repo: GH + 'voterflow',
  },
  {
    slug: 'student-attendance-alert-system',
    name: 'Student Attendance Alert System',
    description: 'Java console app with 75% threshold alerts.',
    tech: ['Java NIO', 'Streams'],
    category: 'systems',
    repo: GH + 'Student-Attendance-Alert-System',
  },
  {
    slug: 'hospital-management-system',
    name: 'Hospital Management System',
    description: 'Command-line system with relational design.',
    tech: ['Python', 'MySQL'],
    category: 'systems',
    repo: GH + 'hospital-management-system',
  },
  {
    slug: 'workforce-management-system',
    name: 'Workforce Management System',
    description: 'Console app with structured employee data.',
    tech: ['C'],
    category: 'systems',
    repo: GH + 'Workforce_management_system',
  },
  {
    slug: 'tetris-game',
    name: 'Tetris Game',
    description: 'Classic puzzle game.',
    tech: ['Python'],
    category: 'systems',
    repo: GH + 'TETRIS_GAME',
  },
]

export type Experience = { id: string; role: string; org: string; date?: string; summary?: string }

export const experience: Experience[] = [
  {
    id: 'xtragrad',
    role: 'AI Intern',
    org: 'XtraGrad',
    summary: 'Built LLM applications using prompt engineering and AI API integration.',
  },
  {
    id: 'codsoft',
    role: 'Java Developer Intern',
    org: 'CodSoft',
    summary: 'Built Java applications using OOP, Collections and exception handling.',
  },
  { id: 'deloitte', role: 'Deloitte Cyber Job Simulation', org: 'Forage', date: 'Feb 2026' },
]

export const events: { name: string; facts: string[] }[] = [
  { name: 'PromptWars', facts: ['Ranked #65 of 19,000+', 'Challenge 2 Top 100', 'Exclusive Edition'] },
  { name: 'GDG Chennai Code for Communities / DevFest Roadshow #4', facts: [] },
  { name: 'GDG Coimbatore Code for Communities', facts: [] },
  { name: 'Chennai Hackfest 2026', facts: ['Selected among 150 of 768'] },
  { name: 'Build with AI Bootcamp, Chennai', facts: [] },
]

export const certifications: { name: string; detail?: string }[] = [
  { name: 'Vodafone Idea Foundation', detail: 'Cybersecurity program' },
  { name: 'Oracle', detail: 'Java' },
  { name: 'Microsoft Learn', detail: 'Cybersecurity, AI / GenAI' },
  { name: 'HackerRank', detail: 'Java, Python, MySQL' },
  { name: 'NPTEL' },
]

export const profiles = [
  { id: 'github', label: 'GitHub', url: 'https://github.com/harshad1234u' },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/harshad-r/' },
  { id: 'leetcode', label: 'LeetCode', url: 'https://leetcode.com/harshad1234k' },
  { id: 'hackerrank', label: 'HackerRank', url: 'https://hackerrank.com/profile/harshad1234k' },
  { id: 'tryhackme', label: 'TryHackMe', url: 'https://tryhackme.com/p/harshad1234k' },
] as const
