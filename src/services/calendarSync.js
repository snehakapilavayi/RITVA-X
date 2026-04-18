// Optional Google Calendar Sync Wrapper
import { loadSettings } from './settingsService'

export async function fetchGoogleEvents(startDateTime, endDateTime) {
  const settings = loadSettings()
  const token = settings.google_access_token
  
  if (!settings.gcal_sync_enabled || !token) {
    return []
  }

  try {
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events")
    // Use clear strict iso strings
    url.searchParams.append("timeMin", startDateTime.toISOString())
    url.searchParams.append("timeMax", endDateTime.toISOString())
    url.searchParams.append("singleEvents", "true")
    url.searchParams.append("orderBy", "startTime")
    
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!res.ok) {
      console.error("Failed to fetch Google Calendar events:", await res.text());
      return [];
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching Google Events:", error);
    return [];
  }
}


export function syncTaskToGoogleCalendar(task) {
  const settings = loadSettings()
  const isGcalSyncEnabled = !!settings.gcal_sync_enabled

  if (!isGcalSyncEnabled) {
    // Google Calendar sync is disabled, skipping.
    // The internal React calendar remains the single system of truth.
    return
  }

  // MOCK: In a real implementation, this would use gapi.client.calendar to push the event
  console.log(`[Google Calendar Sync] Synced task to Google Calendar: ${task.title} (Status: ${task.status})`)
}

export function deleteTaskFromGoogleCalendar(taskId) {
  const settings = loadSettings()
  const isGcalSyncEnabled = !!settings.gcal_sync_enabled

  if (!isGcalSyncEnabled) return

  // MOCK: Delete from GCal
  console.log(`[Google Calendar Sync] Removed task from Google Calendar: ${taskId}`)
}
