// Notes service — localStorage (works offline, no Firebase needed)

const NOTES_KEY = 'ritva_x_notes'

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY)) || []
  } catch { return [] }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export async function createNote(data) {
  const notes = loadNotes()
  const note = {
    id: crypto.randomUUID(),
    title: data.title || 'Untitled',
    content: data.content || '',
    tags: data.tags || [],
    isLocked: data.isLocked || false,
    pin: data.pin || null,
    createdAt: new Date().toISOString(),
  }
  notes.unshift(note)
  saveNotes(notes)
  return note.id
}

export async function getNotes() {
  return loadNotes()
}

export async function updateNote(id, data) {
  const notes = loadNotes()
  const idx = notes.findIndex(n => n.id === id)
  if (idx !== -1) {
    notes[idx] = { ...notes[idx], ...data, updatedAt: new Date().toISOString() }
    saveNotes(notes)
  }
}

export async function deleteNote(id) {
  const notes = loadNotes().filter(n => n.id !== id)
  saveNotes(notes)
}
