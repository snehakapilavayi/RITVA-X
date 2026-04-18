// Utility helpers for RITVA X

/**
 * Format a Firestore timestamp or ISO date string for display
 */
export function formatTime(ts) {
  if (!ts) return '—'
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC'
  } catch { return String(ts) }
}

export function formatDate(ts) {
  if (!ts) return ''
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' })
  } catch { return '' }
}

/**
 * Generate a random execution ID like #09X-K
 */
export function genExecId() {
  const num    = Math.floor(Math.random() * 999).toString().padStart(3, '0')
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  return `#${num}${letter}-${suffix}`
}

/**
 * Simple PIN hash (not cryptographic — just for UX locking)
 */
export function hashPin(pin) {
  return btoa(pin + 'ritva-x-salt')
}

export function checkPin(pin, hash) {
  return hashPin(pin) === hash
}

/**
 * Get relative time ("2h ago", "just now")
 */
export function timeAgo(ts) {
  if (!ts) return ''
  try {
    const d   = ts?.toDate ? ts.toDate() : new Date(ts)
    const sec = Math.floor((Date.now() - d.getTime()) / 1000)
    if (sec < 60)  return 'just now'
    if (sec < 3600) return `${Math.floor(sec/60)}m ago`
    if (sec < 86400) return `${Math.floor(sec/3600)}h ago`
    return `${Math.floor(sec/86400)}d ago`
  } catch { return '' }
}
