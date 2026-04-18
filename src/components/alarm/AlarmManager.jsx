import { useEffect, useRef, useState } from 'react'
import { getTasks } from '../../services/taskService'
import DecisionModal from './DecisionModal'

export default function AlarmManager() {
  const [triggered, setTriggered]   = useState(null)
  const intervalRef                  = useRef(null)
  const notifiedRef                  = useRef(new Set())

  const checkAlarms = async () => {
    try {
      const tasks = await getTasks()
      const now   = Date.now()

      for (const task of tasks) {
        if (
          task.startTime &&
          !['completed', 'avoided'].includes(task.status) &&
          !notifiedRef.current.has(task.id)
        ) {
          let taskTime
          try {
            taskTime = task.startTime?.toDate
              ? task.startTime.toDate().getTime()
              : new Date(task.startTime).getTime()
          } catch { continue }

          if (taskTime <= now && now - taskTime < 5 * 60 * 1000) {
            notifiedRef.current.add(task.id)
            setTriggered(task)
            break
          }
        }
      }
    } catch (e) {
      console.error('Alarm check failed', e)
    }
  }

  useEffect(() => {
    checkAlarms()
    intervalRef.current = setInterval(checkAlarms, 30_000)
    return () => clearInterval(intervalRef.current)
  }, [])

  if (!triggered) return null

  return (
    <DecisionModal
      task={triggered}
      onClose={() => setTriggered(null)}
      onDecision={() => { setTriggered(null); checkAlarms() }}
    />
  )
}
