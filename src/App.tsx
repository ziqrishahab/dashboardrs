import type { ReactElement } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import DoctorsPage from './pages/DoctorsPage'
import SchedulesPage from './pages/SchedulesPage'
import AppointmentsPage from './pages/AppointmentsPage'
import PatientsPage from './pages/PatientsPage'
import EmergencyPage from './pages/EmergencyPage'
import StaffPage from './pages/StaffPage'
import AuditLogsPage from './pages/AuditLogsPage'
import SettingsPage from './pages/SettingsPage'

type ProtectedRouteProps = {
  children: ReactElement
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading"><div className="spinner" /></div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
