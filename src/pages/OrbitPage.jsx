import { useState, useEffect } from 'react'
import { getTasks } from '../services/taskService'
import { fetchGoogleEvents } from '../services/calendarSync'
import { useCombinedParallax } from '../utils/useParallax'
import './OrbitPage.css'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 06:00 – 23:00

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_NAMES   = ['Mo','Tu','We','Th','Fr','Sa','Su']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7 // 0=Mon
}

export default function OrbitPage() {
  const today  = new Date()
  const [viewDate, setView] = useState(today)
  const [selected, setSelected] = useState(today.getDate())
  const [tasks, setTasks] = useState([])
  const [googleEvents, setGoogleEvents] = useState([])
  const [showGoogleEvents, setShowGoogleEvents] = useState(false)
  const parallaxRef = useCombinedParallax()

  useEffect(() => {
    getTasks().then(setTasks)
  }, [])

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  
  useEffect(() => {
    if (showGoogleEvents) {
      const startOfDay = new Date(year, month, selected, 0, 0, 0);
      const endOfDay = new Date(year, month, selected, 23, 59, 59);
      fetchGoogleEvents(startOfDay, endOfDay).then(setGoogleEvents);
    }
  }, [showGoogleEvents, year, month, selected])
  const days  = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  const prevMonth = () => setView(new Date(year, month - 1, 1))
  const nextMonth = () => setView(new Date(year, month + 1, 1))

  const selectedDateStr = new Date(year, month, selected).toDateString()
  const dayTasks = tasks.filter(t => t.startTime && new Date(t.startTime).toDateString() === selectedDateStr)

  // Calculate efficiency based on all non-avoided tasks
  const relevantTasks = tasks.filter(t => t.status !== 'avoided')
  const completedCount = relevantTasks.filter(t => t.status === 'completed').length
  const efficiency = relevantTasks.length > 0 ? Math.round((completedCount / relevantTasks.length) * 100) : 0

  return (
    <main className="page orbit-page" ref={parallaxRef}>
      <div className="page-header animate-fadeInUp" data-parallax-depth="0.04" data-scroll-speed="0.5">
        <div className="page-status">SYSTEM PULSE</div>
        <h1 className="page-title">Orbit</h1>
        <div className="orbit-connected-badge">
          <span className="connected-dot" />
          <span className="label-mono" style={{color:'var(--color-primary)'}}>CONNECTED</span>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="mini-calendar glass-card animate-fadeInUp delay-1" data-parallax-depth="0.03" data-scroll-speed="0.35">
        <div className="cal-header">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <span className="cal-month-label">{MONTH_NAMES[month]} {year}</span>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
        </div>
        <div className="cal-grid">
          {DAY_NAMES.map(d => (
            <span key={d} className="cal-day-name">{d}</span>
          ))}
          {Array.from({ length: firstDow }).map((_, i) => <span key={`e-${i}`} />)}
          {Array.from({ length: days }, (_, i) => i + 1).map(d => (
            <button
              key={d}
              className={`cal-day ${d === selected ? 'selected' : ''} ${d === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? 'today' : ''}`}
              onClick={() => setSelected(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Efficiency */}
      <div className="efficiency-bar glass-card animate-fadeInUp delay-2" data-parallax-depth="0.02" data-scroll-speed="0.55">
        <div className="efficiency-header">
          <span className="label-mono">EFFICIENCY</span>
          <span className="efficiency-value">{efficiency}%</span>
        </div>
        <div className="progress-bar" style={{marginTop:8}}>
          <div className="progress-fill" style={{width:`${efficiency}%`}} />
        </div>
      </div>

      {/* Time grid */}
      <div className="time-grid animate-fadeInUp delay-3" data-parallax-depth="0.015" data-scroll-speed="0.7">
        <div className="time-grid-header">
          <span className="label-mono">⊙ {MONTH_NAMES[month].toUpperCase()} {selected.toString().padStart(2,'0')}, {year}</span>
          <div className="time-view-toggle">
            <label className="label-mono" style={{marginRight: 16, cursor:'pointer', display:'flex', alignItems:'center', gap: 6, fontSize: '0.75rem', opacity: 0.8}}>
              <input type="checkbox" checked={showGoogleEvents} onChange={e => setShowGoogleEvents(e.target.checked)} />
              SHOW GOOGLE EVENTS
            </label>
            <button className="time-view-btn active">Day</button>
            <button className="time-view-btn">Week</button>
          </div>
        </div>

        <div className="time-slots">
          {HOURS.map(h => {
            const slotTasks = dayTasks.filter(t => new Date(t.startTime).getHours() === h)
            const gcalSlotTasks = googleEvents.filter(t => {
              const d = t.start?.dateTime ? new Date(t.start.dateTime) : new Date(t.start?.date || 0)
              return d.getHours() === h
            })

            return (
              <div key={h} className="time-slot">
                <span className="time-slot-label">{String(h).padStart(2,'0')}:00</span>
                <div className="time-slot-track">
                  {slotTasks.map(t => (
                    <div key={t.id} className="orbit-task-event glass-card">
                      <span className="orbit-task-title">{t.title}</span>
                    </div>
                  ))}
                  {showGoogleEvents && gcalSlotTasks.map(t => (
                    <div key={t.id} className="orbit-task-event glass-card" style={{borderLeft: '4px solid #4285F4', backgroundColor: 'rgba(66, 133, 244, 0.05)'}}>
                      <span className="orbit-task-title" style={{color: '#4285F4'}}>{t.summary} </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>



      {/* Observation quote */}
      <div className="orbit-quote animate-fadeInUp delay-5" data-parallax-depth="0.008" data-scroll-speed="1.1">
        <p className="orbit-quote-label label-mono">OBSERVATION</p>
        <p className="orbit-quote-text">
          "The most productive orbits are those where the void is embraced."
        </p>
      </div>
    </main>
  )
}
