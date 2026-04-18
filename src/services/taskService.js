// Task service — localStorage (works offline, no Firebase needed)
import { syncTaskToGoogleCalendar, deleteTaskFromGoogleCalendar } from './calendarSync'

const TASKS_KEY = 'ritva_x_tasks'

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY)) || []
  } catch { return [] }
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

// Generate execution ID e.g. #09X-K
function genExecId() {
  const num = Math.floor(Math.random() * 999).toString().padStart(3, '0')
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  return `#${num}${letter}-${suffix}`
}

export async function createTask(data) {
  const tasks = loadTasks()
  const task = {
    id: crypto.randomUUID(),
    execId: genExecId(),
    title: data.title,
    description: data.description || '',
    startTime: data.startTime || null,
    category: data.category || 'general',
    status: data.startTime ? 'scheduled' : 'todo',
    priority: data.priority || 'normal',
    createdAt: new Date().toISOString(),
  }
  tasks.unshift(task)
  saveTasks(tasks)
  
  if (task.startTime) {
    syncTaskToGoogleCalendar(task)
  }
  
  return task.id
}

export async function getTasks() {
  return loadTasks()
}

export async function updateTask(id, data) {
  const tasks = loadTasks()
  const idx = tasks.findIndex(t => t.id === id)
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() }
    saveTasks(tasks)
    if (tasks[idx].startTime) {
      syncTaskToGoogleCalendar(tasks[idx])
    }
  }
}

export async function deleteTask(id) {
  const tasks = loadTasks().filter(t => t.id !== id)
  saveTasks(tasks)
  deleteTaskFromGoogleCalendar(id)
}

export async function recordDecision(id, decision, rescheduledTime = null) {
  const tasks = loadTasks()
  const idx = tasks.findIndex(t => t.id === id)
  if (idx !== -1) {
    tasks[idx].decision = decision
    tasks[idx].decidedAt = new Date().toISOString()
    tasks[idx].status = decision === 'yes' ? 'completed' : (rescheduledTime ? 'scheduled' : 'avoided')
    if (rescheduledTime) tasks[idx].startTime = rescheduledTime
    saveTasks(tasks)
    syncTaskToGoogleCalendar(tasks[idx])
  }
}
