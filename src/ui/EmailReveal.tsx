import { useRef, useState, useSyncExternalStore } from 'react'
import { getEmail } from '../data/content'

const noSubscribe = () => () => {}

// Email is assembled client-side only (server snapshot is empty), so it never sits in static HTML.
export default function EmailReveal() {
  const email = useSyncExternalStore(noSubscribe, getEmail, () => '')
  const [status, setStatus] = useState('')
  const textRef = useRef<HTMLAnchorElement>(null)

  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      setStatus('Email copied to clipboard.')
    } catch {
      // Clipboard blocked: select the address so the visitor can copy it manually.
      const sel = getSelection()
      if (sel && textRef.current) {
        sel.selectAllChildren(textRef.current)
        setStatus('Press Ctrl+C (or ⌘C) to copy.')
      }
    }
  }

  if (!email) return null
  return (
    <div className="email">
      <a ref={textRef} className="email-address" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className="btn" onClick={copy}>
        Copy email
      </button>
      <p className="email-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
