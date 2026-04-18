import { useState, useEffect, useRef } from 'react'
import './TaskForm.css'

const PRIORITIES = ['critical', 'high', 'normal', 'low']

const PLACEHOLDERS = [
  "Drop your thoughts…",
  "What's pending?",
  "Unload your brain…",
  "What needs execution?",
  "Dump it here…",
]

const DESC_PLACEHOLDERS = [
  "Why does this matter?",
  "Any context or notes…",
  "Add detail if needed…",
  "The 'why' behind this…",
]

export default function TaskForm({ task, forceSchedule, onSubmit, onClose }) {
  const [title, setTitle]       = useState(task?.title || '')
  const [desc, setDesc]         = useState(task?.description || '')
  const [startTime, setStart]   = useState(task?.startTime || '')
  const [priority, setPriority] = useState(task?.priority || 'normal')
  const [saving, setSaving]     = useState(false)
  const inputRef = useRef(null)

  // Random placeholder per mount
  const [placeholder] = useState(() =>
    PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  )
  const [descPlaceholder] = useState(() =>
    DESC_PLACEHOLDERS[Math.floor(Math.random() * DESC_PLACEHOLDERS.length)]
  )

  // Focus the title input (or time input for schedule mode)
  useEffect(() => {
    if (forceSchedule) return
    inputRef.current?.focus()
  }, [forceSchedule])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), description: desc.trim(), startTime, priority })
    } finally {
      setSaving(false)
    }
  }

  const isEditing = !!task
  const formTitle = forceSchedule
    ? '⏱ Schedule Execution'
    : isEditing
    ? 'Edit Execution'
    : 'New Execution'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet task-form-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2 className="modal-title">{formTitle}</h2>

        {forceSchedule && (
          <div className="schedule-nudge-banner">
            <span className="schedule-nudge-icon">🧠</span>
            <p className="schedule-nudge-text">
              This task has been sitting for a while. Give it a time and take control.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mission Title *</label>
            <input
              ref={inputRef}
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={placeholder}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder={descPlaceholder}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {forceSchedule ? '⚡ Set Execution Time *' : 'Start Time'}
            </label>
            <input
              className={`form-input ${forceSchedule ? 'form-input--highlighted' : ''}`}
              type="datetime-local"
              value={startTime}
              onChange={e => setStart(e.target.value)}
              required={forceSchedule}
              autoFocus={forceSchedule}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="priority-pills">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`priority-pill ${priority === p ? 'active' : ''} priority-${p}`}
                  onClick={() => setPriority(p)}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving
                ? 'Transmitting…'
                : forceSchedule
                ? '⏱ Schedule'
                : isEditing
                ? 'Update'
                : 'Launch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
