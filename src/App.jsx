import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import AppHeader from './components/layout/AppHeader'
import AlarmManager from './components/alarm/AlarmManager'
import ParticleBackground from './components/layout/ParticleBackground'
import VoidPage from './pages/VoidPage'
import PulsePage from './pages/PulsePage'
import EchoPage from './pages/EchoPage'
import OrbitPage from './pages/OrbitPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ParticleBackground />
      <AppHeader />
      <AlarmManager />
      <Routes>
        <Route path="/" element={<Navigate to="/void" replace />} />
        <Route path="/void" element={<VoidPage />} />
        <Route path="/pulse" element={<PulsePage />} />
        <Route path="/echo" element={<EchoPage />} />
        <Route path="/orbit" element={<OrbitPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  )
}
