import { useState, useEffect } from 'react'
import { getNotes, createNote, updateNote, deleteNote } from '../services/notesService'
import { useCombinedParallax } from '../utils/useParallax'
import './EchoPage.css'

const TAGS = ['research', 'personal', 'philosophy', 'code', 'ideas']

export default function EchoPage() {
  const [notes, setNotes]         = useState([])
  const [activeNote, setActive]   = useState(null)
  const [title, setTitle]         = useState('')
  const [content, setContent]     = useState('')
  const [selectedTags, setTags]   = useState([])
  const [isLocked, setIsLocked]   = useState(false)
  const [pin, setPin]             = useState('')
  const [unlockPin, setUnlockPin] = useState('')
  const [unlocking, setUnlocking] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [privacyMode, setPrivacy] = useState(false)
  const parallaxRef = useCombinedParallax()

  const load = async () => {
    const data = await getNotes()
    setNotes(data)
  }

  useEffect(() => { load() }, [])

  const transmit = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      if (activeNote) {
        await updateNote(activeNote.id, { title, content, tags: selectedTags })
      } else {
        await createNote({ title, content, tags: selectedTags, isLocked, pin: isLocked ? pin : null })
        setTitle(''); setContent(''); setTags([]); setIsLocked(false); setPin('')
      }
      await load()
      setActive(null)
    } finally {
      setSaving(false)
    }
  }

  const selectNote = (note) => {
    if (note.isLocked) { setUnlocking(note); return }
    setActive(note)
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags || [])
  }

  const tryUnlock = (note) => {
    if (unlockPin === note.pin) {
      setUnlocking(null); setUnlockPin('')
      setActive(note); setTitle(note.title); setContent(note.content)
    } else {
      alert('Invalid PIN')
    }
  }

  const toggleTag = (tag) => {
    setTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag])
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts)
      return d.toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' })
    } catch { return '' }
  }

  return (
    <main className="page echo-page" ref={parallaxRef}>
      <div className="echo-header animate-fadeInUp" data-parallax-depth="0.04" data-scroll-speed="0.5">
        <div>
          <h1 className="page-title">Echo</h1>
          <p className="echo-subtitle">Capture fleeting signals from the subconscious void.</p>
        </div>
        <div className="echo-toggles">
          <button
            className={`toggle-btn ${privacyMode ? 'active' : ''}`}
            onClick={() => setPrivacy(p => !p)}
          >
            PRIVACY
          </button>
        </div>
      </div>

      {/* Compose area */}
      <div className="echo-compose glass-card animate-fadeInUp delay-1" data-parallax-depth="0.03" data-scroll-speed="0.4">
        <input
          className="echo-title-input"
          placeholder="Transmission title…"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="echo-content-input"
          placeholder="Begin transmission…"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
        />
        <div className="echo-compose-footer">
          <div className="echo-tag-row">
            {TAGS.map(tag => (
              <button
                key={tag}
                className={`echo-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
          <div className="echo-compose-actions">
            <label className="lock-toggle">
              <input type="checkbox" checked={isLocked} onChange={e => setIsLocked(e.target.checked)} />
              <span className="lock-icon">{isLocked ? '🔒' : '🔓'}</span>
            </label>
            {isLocked && (
              <input
                className="form-input pin-input"
                placeholder="PIN"
                type="password"
                maxLength={6}
                value={pin}
                onChange={e => setPin(e.target.value)}
              />
            )}
            <button className="btn-primary echo-transmit-btn" onClick={transmit} disabled={saving}>
              {saving ? '…' : 'Transmit'}
            </button>
          </div>
        </div>
      </div>

      {/* Notes list */}
      <div className="notes-list animate-fadeIn delay-2">
        {notes.length === 0 ? (
          <div className="empty-state" data-parallax-depth="0.02">
            <div className="empty-state-icon">◈</div>
            <p className="empty-state-text">No transmissions found</p>
          </div>
        ) : (
          notes.map((note, i) => (
            <div
              key={note.id}
              className={`note-card glass-card animate-fadeInUp delay-${Math.min(i+1,5)} ${privacyMode && note.isLocked ? 'blurred' : ''}`}
              onClick={() => selectNote(note)}
              data-parallax-depth={0.01 + i * 0.003}
              data-scroll-speed={0.3 + i * 0.06}
            >
              <div className="note-card-top">
                <span className="label-mono note-date">CREATED AT: {formatDate(note.createdAt)}</span>
                <div className="note-card-actions">
                  {note.isLocked && <span className="note-lock-icon">🔒</span>}
                  <button
                    className="note-delete-btn"
                    onClick={e => { e.stopPropagation(); deleteNote(note.id).then(load) }}
                    aria-label="Delete note"
                  >✕</button>
                </div>
              </div>

              {note.isLocked && unlocking?.id !== note.id ? (
                <div className="note-locked">
                  <p className="label-mono" style={{color:'var(--color-secondary)'}}>DECRYPT SESSION</p>
                </div>
              ) : (
                <>
                  <h3 className="note-title">{note.title || 'Untitled'}</h3>
                  {!privacyMode && (
                    <p className="note-preview">{note.content}</p>
                  )}
                </>
              )}

              {note.tags?.length > 0 && (
                <div className="note-tags">
                  {note.tags.map(tag => (
                    <span key={tag} className="note-tag">#{tag.toUpperCase()}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Unlock modal */}
      {unlocking && (
        <div className="modal-overlay" onClick={() => { setUnlocking(null); setUnlockPin('') }}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">🔒 Decrypt Session</h2>
            <p style={{color:'var(--text-secondary)', fontSize:14, marginBottom:16}}>
              Enter PIN to access this transmission.
            </p>
            <input
              className="form-input"
              type="password"
              placeholder="Enter PIN…"
              maxLength={6}
              value={unlockPin}
              onChange={e => setUnlockPin(e.target.value)}
              autoFocus
            />
            <div className="form-actions" style={{marginTop:16}}>
              <button className="btn-ghost" onClick={() => { setUnlocking(null); setUnlockPin('') }}>Cancel</button>
              <button className="btn-primary" onClick={() => tryUnlock(unlocking)}>Decrypt</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {activeNote && (
        <div className="modal-overlay" onClick={() => setActive(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">Edit Transmission</h2>
            <input className="form-input" style={{marginBottom:12}} value={title} onChange={e => setTitle(e.target.value)} placeholder="Title…" />
            <textarea className="form-input" style={{minHeight:140, marginBottom:16}} value={content} onChange={e => setContent(e.target.value)} />
            <div className="form-actions">
              <button className="btn-ghost" onClick={() => setActive(null)}>Cancel</button>
              <button className="btn-primary" onClick={transmit} disabled={saving}>{saving ? '…' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
