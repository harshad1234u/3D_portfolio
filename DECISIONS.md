# Decisions and plan amendments

Approved answers to `PLAN.md` §0, plus changes. Where this file and `PLAN.md` disagree, **this file wins**.

## Answers
1. Project lives in this fresh repo (`harshad-portfolio`).
2. Repo names: CivicInsight AI = `CivicInsight_AI`; Facial Emotion Recognition = `realtime-facial-emotion-recognition`. LexGuard AI and CivoAI: no link (not public yet).
3. Project order: the 1–17 order from the brief, newest first.
4. Skill→project links, beyond what the tech lists give:
   - Docker → CarbonIQ (it has a Dockerfile).
   - SQL → CarbonIQ, AI Quiz App, Online Food Ordering AI Bot, Hospital Management System.
   - Git, GitHub → all 17 projects.
   - Log analysis → no project; linked to the Deloitte Cyber Job Simulation beacon in Experience.
   - Linux → shown with no linked project.
   - CNNs → CIFAKE, Facial Emotion Recognition.
   - Vite → CivicInsight AI, LexGuard AI, CarbonIQ.
   - Python → also CivoAI.
   - Prompt engineering → XtraGrad experience entry.
   - PostgreSQL via Supabase (CarbonIQ, AI Quiz App); Firebase via Firestore (PhishCatch).
5. Tooling: if TypeScript 7 breaks eslint or Vite, use the latest 6.x and report it. **Status: TypeScript 6.0.3 is installed** because `typescript-eslint@8.71.0` has the peer range `typescript >=4.8.4 <6.1.0`. Move to TS 7 when typescript-eslint supports it.
6. `harshad.me` is owned. **No `public/CNAME` until the launch milestone (M9).** Until then deploy and test on the github.io address; the workflow sets `VITE_BASE=/harshad-portfolio/`. At launch: add `public/CNAME`, set `VITE_BASE` to `/` in `.github/workflows/deploy.yml`.

## Amendments to the plan
- **No placeholder text on the public site, ever.**
  - XtraGrad (AI Intern): "Built LLM applications using prompt engineering and AI API integration."
  - CodSoft (Java Developer Intern): "Built Java applications using OOP, Collections and exception handling."
  - No dates until supplied. Deloitte (Forage, Feb 2026) keeps its stated date.
- **Skills (§6):** simple geometric totems (one primitive per domain family, not a bespoke model per skill) with the skill name always visible as a label.
- **World (§11):** procedural geometry only for now. Consider a CC0 pack only if a specific object looks weak; record its licence in `public/models/CREDITS.md`.
- **About copy:** written from the brief only: third-year CSE student, K. Ramakrishnan College of Technology, aspiring AI / cybersecurity / full-stack developer. Nothing else invented.
- **Privacy:** only the email, the five profile links and project repo links. No phone, city, marks, CGPA, resume file, or other personal data anywhere.
- **Milestone reports:** each ends with what was built, what was verified (real command output), and remaining placeholders.
