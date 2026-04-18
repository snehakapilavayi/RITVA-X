import { useState, useEffect } from 'react'
import { useCombinedParallax } from '../utils/useParallax'
import { loadSettings, updateSetting } from '../services/settingsService'
import Login from '../components/Login'
import './SettingsPage.css'

export default function SettingsPage() {
  const parallaxRef = useCombinedParallax()
  const [gcalSync, setGcalSync] = useState(false)

  useEffect(() => {
    const settings = loadSettings()
    setGcalSync(!!settings.gcal_sync_enabled)
  }, [])

  const toggleGcalSync = () => {
    const newVal = !gcalSync
    setGcalSync(newVal)
    updateSetting('gcal_sync_enabled', newVal)
  }

  return (
    <main className="page settings-page" ref={parallaxRef}>
      <div className="page-header animate-fadeInUp" data-parallax-depth="0.04" data-scroll-speed="0.5">
        <div className="page-status">CONFIG</div>
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="settings-section glass-card animate-fadeInUp delay-1" data-parallax-depth="0.03" data-scroll-speed="0.35">
        <p className="settings-section-title label-mono">SYSTEM</p>
        <div className="settings-item">
          <span className="settings-item-label">Version</span>
          <span className="settings-item-value">RITVA X v1.0</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Theme</span>
          <span className="settings-item-value text-glow">Event Horizon</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Mode</span>
          <span className="settings-item-value">Personal OS</span>
        </div>
      </div>

      <div className="settings-section glass-card animate-fadeInUp delay-2" data-parallax-depth="0.02" data-scroll-speed="0.55">
        <p className="settings-section-title label-mono">INTEGRATIONS</p>
        <div className="settings-item">
          <span className="settings-item-label">Google Calendar Sync</span>
          {gcalSync ? (
            <button 
              className="btn-ghost settings-connect-btn active"
              onClick={toggleGcalSync}
            >
              Disconnect
            </button>
          ) : (
            <Login onLogin={toggleGcalSync} />
          )}
        </div>
      </div>


      <div className="settings-section glass-card animate-fadeInUp delay-4" data-parallax-depth="0.01" data-scroll-speed="0.9">
        <p className="settings-section-title label-mono">ABOUT</p>
        <div className="settings-item">
          <span className="settings-item-label">Tagline</span>
          <span className="settings-item-value">Where consistency becomes identity.</span>
        </div>
        <div className="settings-item">
          <span className="settings-item-label">Vision</span>
          <span className="settings-item-value">Daily execution builds discipline.</span>
        </div>
      </div>
    </main>
  )
}
