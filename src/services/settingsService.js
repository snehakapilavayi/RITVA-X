// Settings service — localStorage

const SETTINGS_KEY = 'ritva_x_settings'

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
  } catch { return {} }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function updateSetting(key, value) {
  const settings = loadSettings()
  settings[key] = value
  saveSettings(settings)
}
