import { useState, useEffect } from 'react'
import { getTasks } from '../services/taskService'
import { useNavigate } from 'react-router-dom'
import { useCombinedParallax } from '../utils/useParallax'
import './PulsePage.css'

const PRIORITY_COLOR = {
  critical: '#FF3E6C',
  high: '#FF9500',
  normal: 'var(--text-secondary)',
  low: 'var(--text-muted)',
}

export default function PulsePage() {
  const [tasks, setTasks]   = useState([])
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()
  const parallaxRef = useCombinedParallax()

  useEffect(() => {
    getTasks().then(data => {
      const active = data.filter(t => !['completed', 'avoided'].includes(t.status))
      setTasks(active)
      if (active.length > 0) setSelected(active[0])
    })
  }, [])

  if (tasks.length === 0) {
    return (
      <main className="page pulse-page" ref={parallaxRef}>
        <div className="page-header animate-fadeInUp" data-parallax-depth="0.04" data-scroll-speed="0.6">
          <div className="page-status">SYSTEM LAB</div>
          <h1 className="page-title">Execution<br/>Pulse</h1>
        </div>
        <div className="empty-state" data-parallax-depth="0.02">
          <div className="empty-state-icon">⚡</div>
          <p className="empty-state-text">No active executions</p>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:8 }}>
            Add tasks in the Void to see them here
          </p>
          <button className="btn-primary" style={{marginTop:20}} onClick={() => navigate('/void')}>
            Go to Void
          </button>
        </div>
      </main>
    )
  }

  const task = selected || tasks[0]
  const priority = task?.priority || 'normal'

  return (
    <main className="page pulse-page" ref={parallaxRef}>
      <div className="page-header animate-fadeInUp" data-parallax-depth="0.04" data-scroll-speed="0.6">
        <div className="page-status">SYSTEM LAB</div>
        <h1 className="page-title">Execution<br/>Pulse</h1>
      </div>

      {tasks.length > 1 && (
        <div className="pulse-task-picker" data-parallax-depth="0.02">
          {tasks.map(t => (
            <button
              key={t.id}
              className={`picker-btn ${selected?.id === t.id ? 'active' : ''}`}
              onClick={() => setSelected(t)}
            >
              {t.execId}
            </button>
          ))}
        </div>
      )}

      <div className="pulse-card glass-card animate-fadeInUp delay-1" data-parallax-depth="0.03" data-scroll-speed="0.4">
        <div className="pulse-card-top">
          <span className="badge badge-running">CRITICAL PATH</span>
          <span className="label-mono">{task.execId}</span>
        </div>
        <h2 className="pulse-task-title">{task.title}</h2>
        {task.description && (
          <p className="pulse-task-desc">{task.description}</p>
        )}

        <div className="pulse-metric">
          <div className="pulse-metric-header">
            <span className="label-mono">LINK INTEGRITY</span>
            <span className="pulse-metric-value">82%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '82%' }} />
          </div>
        </div>
      </div>

      <div className="atmospherics glass-card animate-fadeInUp delay-2" data-parallax-depth="0.02" data-scroll-speed="0.6">
        <p className="label-mono atmospherics-title">ATMOSPHERICS</p>
        <div className="atm-row">
          <span className="atm-label">Risk Factor</span>
          <span className="atm-value" style={{ color: PRIORITY_COLOR[priority] }}>
            {priority === 'critical' ? 'Elevated' : priority === 'high' ? 'Moderate' : 'Nominal'}
          </span>
        </div>
        <div className="atm-row">
          <span className="atm-label">Priority</span>
          <span className="atm-value" style={{ color: PRIORITY_COLOR[priority] }}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
        </div>
        <div className="atm-row">
          <span className="atm-label">Time Decay</span>
          <span className="atm-value">{task.startTime ? 'Scheduled' : 'Unscheduled'}</span>
        </div>
      </div>

      <div className="observation-box glass-card animate-fadeInUp delay-3" data-parallax-depth="0.015" data-scroll-speed="0.8">
        <p className="label-mono" style={{marginBottom:8}}>OBSERVATION</p>
        <p className="observation-text">
          {task.description || 'No additional observations logged for this execution.'}
        </p>
      </div>

      <div className="decision-matrix-pulse animate-fadeInUp delay-4" data-parallax-depth="0.01" data-scroll-speed="1.0">
        <p className="label-mono" style={{marginBottom:12, textAlign:'center'}}>DECISION MATRIX</p>

        <button className="pulse-decision-btn pulse-do" onClick={() => navigate('/void')}>
          <span className="pulse-btn-icon">⚡</span>
          <div>
            <div className="pulse-btn-label">DO IT NOW</div>
            <div className="pulse-btn-sub">INITIATE EXECUTION</div>
          </div>
        </button>

        <div className="pulse-decision-row">
          <button className="pulse-decision-btn pulse-delegate">
            <span className="pulse-btn-icon">◈</span>
            <div>
              <div className="pulse-btn-label">DELEGATE</div>
              <div className="pulse-btn-sub">ASSIGN TO ECHO</div>
            </div>
          </button>

          <button className="pulse-decision-btn pulse-defer" onClick={() => navigate('/orbit')}>
            <span className="pulse-btn-icon">⏱</span>
            <div>
              <div className="pulse-btn-label">DEFER</div>
              <div className="pulse-btn-sub">SCHEDULE PULSE</div>
            </div>
          </button>
        </div>
      </div>
    </main>
  )
}
