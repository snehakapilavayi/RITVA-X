import { useState, useEffect, useCallback } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService'
import { useCombinedParallax } from '../utils/useParallax'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import './VoidPage.css'

const STATUS_ORDER = ['running', 'scheduled', 'todo', 'queued', 'standby', 'completed', 'avoided']

// How many hours before we consider a task "stale"
const STALE_HOURS = 24

const EMPTY_MESSAGES = [
  "Nothing in your mind right now…",
  "The void is clear. Add something.",
  "Your brain is empty. Unload it here.",
  "All clear. What's next?",
]

function isStale(task) {
  if (!task.createdAt || ['completed', 'avoided'].includes(task.status)) return false
  try {
    const created = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt)
    return (Date.now() - created.getTime()) > STALE_HOURS * 60 * 60 * 1000
  } catch { return false }
}

export default function VoidPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [scheduleTask, setScheduleTask] = useState(null)
  const [recentlyCompleted, setRecentlyCompleted] = useState(new Set())
  const parallaxRef = useCombinedParallax()

  const load = useCallback(async () => {
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (data) => {
    await createTask(data)
    await load()
    setShowForm(false)
  }

  const handleEdit = async (data) => {
    if (scheduleTask) {
      // Scheduling a stale task
      await updateTask(scheduleTask.id, { ...data, status: 'scheduled' })
      setScheduleTask(null)
    } else {
      await updateTask(editTask.id, data)
      setEditTask(null)
    }
    await load()
  }

  const handleDelete = async (id) => {
    // Smooth removal — already animated by TaskCard
    await deleteTask(id)
    await load()
  }

  const handleComplete = async (id) => {
    // Mark as recently completed for the 2-second auto-move
    setRecentlyCompleted(prev => new Set(prev).add(id))
    await updateTask(id, { status: 'completed', decision: 'yes' })

    // After 2s, reload to move to completed section
    setTimeout(async () => {
      setRecentlyCompleted(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      await load()
    }, 2000)
  }

  const handleSchedule = (task) => {
    setScheduleTask(task)
  }

  const sorted = [...tasks].sort((a, b) =>
    STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  )

  // Filter out recently completed from active list (they're animating out)
  const active = sorted.filter(t =>
    !['completed', 'avoided'].includes(t.status) && !recentlyCompleted.has(t.id)
  )
  const done = sorted.filter(t => ['completed', 'avoided'].includes(t.status))

  const emptyMsg = EMPTY_MESSAGES[Math.floor(Date.now() / 86400000) % EMPTY_MESSAGES.length]

  return (
    <main className="page void-page" ref={parallaxRef}>
      <div className="page-header animate-fadeInUp" data-parallax-depth="0.04" data-scroll-speed="0.6">
        <div className="page-status">SYSTEM ONLINE</div>
        <h1 className="page-title">Void</h1>
      </div>

      {loading ? (
        <div className="void-loading">
          <div className="loading-bar" />
          <span className="label-mono">SCANNING EXECUTIONS…</span>
        </div>
      ) : (
        <>
          {active.length === 0 && done.length === 0 ? (
            <div className="empty-state animate-fadeIn" data-parallax-depth="0.02">
              <div className="empty-state-glow" />
              <div className="empty-state-icon">◈</div>
              <p className="empty-state-title">{emptyMsg}</p>
              <p className="empty-state-hint">
                Tap <button className="empty-state-plus" onClick={() => setShowForm(true)}>+</button> to drop a thought
              </p>
              <div className="empty-state-swipe-hint">
                <div className="swipe-hint-line" />
                <span className="label-mono">SWIPE RIGHT TO COMPLETE • LEFT TO DELETE</span>
                <div className="swipe-hint-line" />
              </div>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div className="task-list">
                  {active.map((task, i) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      className={`delay-${Math.min(i + 1, 5)}`}
                      onEdit={() => setEditTask(task)}
                      onDelete={() => handleDelete(task.id)}
                      onComplete={() => handleComplete(task.id)}
                      onSchedule={handleSchedule}
                      stale={isStale(task)}
                      parallaxDepth={0.01 + i * 0.005}
                      scrollSpeed={0.3 + i * 0.08}
                    />
                  ))}
                </div>
              )}

              {active.length === 0 && done.length > 0 && (
                <div className="empty-state animate-fadeIn" data-parallax-depth="0.02">
                  <div className="empty-state-icon">⚡</div>
                  <p className="empty-state-title">All executions complete</p>
                  <p className="empty-state-hint">You've cleared the void. Impressive.</p>
                </div>
              )}

              {done.length > 0 && (
                <div className="done-section animate-fadeInUp">
                  <div className="section-label" data-scroll-speed="0.5">
                    <div className="section-label-left">
                      <span className="section-done-dot" />
                      <span className="label-mono">Completed</span>
                    </div>
                    <span className="section-count">{done.length}</span>
                  </div>
                  <div className="task-list task-list--done">
                    {done.map((task, i) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        className={`delay-${Math.min(i + 1, 5)}`}
                        onEdit={() => setEditTask(task)}
                        onDelete={() => handleDelete(task.id)}
                        muted
                        parallaxDepth={0.01}
                        scrollSpeed={0.15}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <button className="fab" onClick={() => setShowForm(true)} aria-label="Add task">
        +
      </button>

      {showForm && (
        <TaskForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {editTask && (
        <TaskForm
          task={editTask}
          onSubmit={handleEdit}
          onClose={() => setEditTask(null)}
        />
      )}

      {scheduleTask && (
        <TaskForm
          task={scheduleTask}
          forceSchedule
          onSubmit={handleEdit}
          onClose={() => setScheduleTask(null)}
        />
      )}
    </main>
  )
}
