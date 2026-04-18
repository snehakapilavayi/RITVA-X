import { useState, useEffect } from 'react'
import { recordDecision } from '../../services/taskService'
import './DecisionModal.css'

const COUNTDOWN = 30

export default function DecisionModal({ task, onClose, onDecision }) {
  const [seconds, setSeconds]     = useState(COUNTDOWN)
  const [rescheduling, setReschedule] = useState(false)
  const [newTime, setNewTime]     = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(t); setReschedule(true) }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const decide = async (decision, reschedTime = null) => {
    setSaving(true)
    try {
      await recordDecision(task.id, decision, reschedTime)
      onDecision()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="decision-overlay animate-fadeIn">
      <div className="decision-panel">
        <div className="decision-header">
          <span className="label-mono decision-system-label">EXECUTION PULSE</span>
          <span className="decision-exec-id">{task.execId}</span>
        </div>

        <h2 className="decision-title">{task.title}</h2>

        {task.description && (
          <p className="decision-desc">{task.description}</p>
        )}

        <div className="decision-divider" />

        {!rescheduling ? (
          <>
            <div className="decision-countdown">
              <span className="label-mono">AUTO-DEFER IN</span>
              <span className="countdown-number">{seconds}s</span>
            </div>

            <div className="decision-matrix">
              <button
                className="decision-btn decision-btn--do"
                onClick={() => decide('yes')}
                disabled={saving}
              >
                <span className="decision-btn-icon">⚡</span>
                <span className="decision-btn-label">DO IT NOW</span>
                <span className="decision-btn-sub">INITIATE EXECUTION</span>
              </button>

              <button
                className="decision-btn decision-btn--defer"
                onClick={() => setReschedule(true)}
                disabled={saving}
              >
                <span className="decision-btn-icon">⏱</span>
                <span className="decision-btn-label">DEFER</span>
                <span className="decision-btn-sub">SCHEDULE PULSE</span>
              </button>

              <button
                className="decision-btn decision-btn--avoid"
                onClick={() => decide('no')}
                disabled={saving}
              >
                <span className="decision-btn-icon">✕</span>
                <span className="decision-btn-label">AVOID</span>
                <span className="decision-btn-sub">MARK AS SKIPPED</span>
              </button>
            </div>
          </>
        ) : (
          <div className="reschedule-form">
            <p className="label-mono" style={{marginBottom:12}}>RESCHEDULE EXECUTION</p>
            <input
              type="datetime-local"
              className="form-input"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              style={{marginBottom:16}}
            />
            <div className="form-actions">
              <button className="btn-ghost" onClick={() => decide('no')}>Skip</button>
              <button
                className="btn-primary"
                onClick={() => decide('no', newTime)}
                disabled={!newTime || saving}
              >
                {saving ? 'Updating…' : 'Reschedule'}
              </button>
            </div>
          </div>
        )}

        <button className="decision-close" onClick={onClose}>✕</button>
      </div>
    </div>
  )
}
