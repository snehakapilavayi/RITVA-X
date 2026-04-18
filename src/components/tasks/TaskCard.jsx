import { useState, useRef } from 'react'
import './TaskCard.css'

const STATUS_CONFIG = {
  running:   { label: 'RUNNING',   cls: 'badge-running' },
  queued:    { label: 'QUEUED',    cls: 'badge-queued' },
  standby:   { label: 'STANDBY',  cls: 'badge-standby' },
  scheduled: { label: 'SCHEDULED',cls: 'badge-scheduled' },
  todo:      { label: 'TODO',      cls: 'badge-queued' },
  completed: { label: 'DONE',      cls: 'badge-done' },
  avoided:   { label: 'AVOIDED',  cls: 'badge-avoided' },
}

const PRIORITY_CONFIG = {
  critical: { label: 'CRITICAL', color: 'var(--color-primary)' },
  high:     { label: 'HIGH',     color: '#FF9500' },
  normal:   { label: 'NORMAL',   color: 'var(--text-muted)' },
  low:      { label: 'LOW',      color: 'var(--text-muted)' },
}

function formatTime(startTime) {
  if (!startTime) return '—'
  try {
    const d = startTime?.toDate ? startTime.toDate() : new Date(startTime)
    return d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) + ' UTC'
  } catch { return startTime }
}

export default function TaskCard({
  task,
  className = '',
  onEdit,
  onDelete,
  onComplete,
  onSchedule,
  muted,
  parallaxDepth = 0,
  scrollSpeed = 0,
  stale = false,
}) {
  const statusCfg   = STATUS_CONFIG[task.status]   || STATUS_CONFIG.todo
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal
  const isRunning   = task.status === 'running'
  const isDone      = ['completed', 'avoided'].includes(task.status)

  // ── Completion animation state ──
  const [completing, setCompleting] = useState(false)

  // ── Swipe gesture ──
  const touchStart = useRef({ x: 0, y: 0 })
  const cardRef    = useRef(null)
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)

  const SWIPE_THRESHOLD = 100

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    setSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!swiping) return
    const dx = e.touches[0].clientX - touchStart.current.x
    const dy = Math.abs(e.touches[0].clientY - touchStart.current.y)
    // Only swipe horizontally
    if (dy > 40) { setSwiping(false); setSwipeX(0); return }
    setSwipeX(dx)
  }

  const handleTouchEnd = () => {
    if (!swiping) return
    setSwiping(false)

    if (swipeX > SWIPE_THRESHOLD && onComplete && !isDone) {
      // Swipe right → complete
      triggerComplete()
    } else if (swipeX < -SWIPE_THRESHOLD && onDelete) {
      // Swipe left → delete
      triggerDelete()
    } else {
      setSwipeX(0)
    }
  }

  const triggerComplete = () => {
    setCompleting(true)
    setTimeout(() => {
      onComplete?.(task.id)
    }, 500)
  }

  const triggerDelete = () => {
    setCompleting(true) // reuse the exit animation
    setTimeout(() => {
      onDelete?.(task.id)
    }, 400)
  }

  // Compute swipe visual feedback
  const swipeStyle = swipeX !== 0 && swiping ? {
    transform: `translateX(${swipeX * 0.6}px) rotate(${swipeX * 0.02}deg)`,
    transition: 'none',
  } : {}

  const swipeBgColor = swipeX > 60
    ? 'rgba(0, 255, 136, 0.15)'
    : swipeX < -60
    ? 'rgba(255, 62, 108, 0.15)'
    : 'transparent'

  return (
    <div className="task-card-wrapper" style={{ position: 'relative' }}>
      {/* Swipe background indicator */}
      <div className="swipe-indicator" style={{ background: swipeBgColor }}>
        {swipeX > 60 && <span className="swipe-label swipe-label--left">⚡ COMPLETE</span>}
        {swipeX < -60 && <span className="swipe-label swipe-label--right">✕ DELETE</span>}
      </div>

      <div
        ref={cardRef}
        className={`task-card glass-card animate-fadeInUp ${className} ${muted ? 'task-card--muted' : ''} ${completing ? 'task-card--completing' : ''} ${stale ? 'task-card--stale' : ''}`}
        data-parallax-depth={parallaxDepth}
        data-scroll-speed={scrollSpeed}
        style={swipeStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="task-card-top">
          <span className="label-mono task-exec-id">{task.execId || '#000-X'}</span>
          <span className={`badge ${statusCfg.cls}`}>{statusCfg.label}</span>
        </div>

        <h3 className="task-title">{task.title}</h3>

        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}

        <div className="task-meta">
          <div className="task-meta-item">
            <span className="label-mono">START TIME</span>
            <span className="task-meta-value">{formatTime(task.startTime)}</span>
          </div>
          <div className="task-meta-item">
            <span className="label-mono">{task.priority ? 'PRIORITY' : 'STATUS'}</span>
            <span className="task-meta-value" style={{ color: priorityCfg.color }}>
              {task.priority ? priorityCfg.label : (task.decision === 'yes' ? '✓ Executed' : task.decision === 'no' ? '✕ Avoided' : 'Awaiting Signal')}
            </span>
          </div>
        </div>

        {isRunning && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '35%' }}>
              <span className="progress-dot" style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)' }} />
            </div>
          </div>
        )}

        {/* Stale task suggestion */}
        {stale && !isDone && (
          <div className="stale-nudge" onClick={(e) => { e.stopPropagation(); onSchedule?.(task) }}>
            <span className="stale-nudge-icon">⏱</span>
            <span className="stale-nudge-text">This has been sitting a while — schedule it?</span>
            <span className="stale-nudge-arrow">→</span>
          </div>
        )}

        <div className="task-card-actions">
          {!isDone && onComplete && (
            <button
              className="task-action-btn task-action-btn--complete"
              onClick={(e) => { e.stopPropagation(); triggerComplete() }}
              aria-label="Complete task"
            >
              ⚡ Complete
            </button>
          )}
          <button className="task-action-btn" onClick={(e) => { e.stopPropagation(); onEdit?.() }} aria-label="Edit task">✎ Edit</button>
          <button className="task-action-btn task-action-btn--danger" onClick={(e) => { e.stopPropagation(); triggerDelete() }} aria-label="Delete task">✕ Delete</button>
        </div>

        {/* Completion flash overlay */}
        {completing && (
          <div className="completion-flash">
            <span className="completion-flash-icon">⚡</span>
          </div>
        )}
      </div>
    </div>
  )
}
