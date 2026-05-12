import { useEffect, useState } from 'react'
import axios from 'axios'

type EmergencySession = {
  id: string | number
  patient_name?: string
  patient?: { name?: string }
  complaint?: string
  triage_level?: number
  status?: string
  created_at?: string
}

export default function EmergencyPage() {
  const [sessions, setSessions] = useState<EmergencySession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSessions() }, [])

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/v1/emergency')
      setSessions(res.data.sessions || res.data || [])
    } catch {
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const updateTriage = async (id: EmergencySession['id'], triage: number) => {
    try {
      await axios.put(`/api/v1/emergency/${id}`, { triage_level: triage })
      fetchSessions()
    } catch {
      alert('Gagal update triase')
    }
  }

  const dischargePatient = async (id: EmergencySession['id']) => {
    if (!confirm('Tutup sesi IGD ini?')) return
    try {
      await axios.put(`/api/v1/emergency/${id}`, { status: 'discharged' })
      fetchSessions()
    } catch {
      alert('Gagal menutup sesi')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const triageColor = (level?: number) => {
    const map: Record<number, string> = { 1: 'badge-danger', 2: 'badge-warning', 3: 'badge-info', 4: 'badge-success', 5: 'badge-gray' }
    return `badge ${map[level ?? 0] || 'badge-gray'}`
  }

  const statusBadge = (status?: string) => {
    const map: Record<string, string> = { active: 'badge-danger', in_treatment: 'badge-warning', discharged: 'badge-success' }
    return `badge ${map[status || ''] || 'badge-gray'}`
  }

  return (
    <div>
      <div className="page-header">
        <h1>🚑 IGD - Gawat Darurat</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red">🚑</div>
          <div className="stat-info">
            <h3>{sessions.filter(s => s.status === 'active' || s.status === 'in_treatment').length}</h3>
            <p>Pasien Aktif</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">🔴</div>
          <div className="stat-info">
            <h3>{sessions.filter(s => s.triage_level === 1).length}</h3>
            <p>Kritis (Triase 1)</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Daftar Pasien IGD</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pasien</th>
                <th>Keluhan</th>
                <th>Triase</th>
                <th>Status</th>
                <th>Masuk</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray" style={{ padding: '2rem' }}>Tidak ada pasien IGD</td></tr>
              ) : sessions.map(s => (
                <tr key={s.id}>
                  <td className="font-semibold">{s.patient_name || s.patient?.name || 'Pasien'}</td>
                  <td className="text-sm text-gray">{s.complaint || '-'}</td>
                  <td>
                    <span className={triageColor(s.triage_level)}>
                      Level {s.triage_level}
                    </span>
                  </td>
                  <td><span className={statusBadge(s.status)}>{s.status}</span></td>
                  <td className="text-xs text-gray">
                    {s.created_at ? new Date(s.created_at).toLocaleString('id-ID') : '-'}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <select className="form-select" style={{ width: 100, fontSize: '0.75rem', padding: '0.25rem' }}
                        value={s.triage_level || ''}
                        onChange={e => updateTriage(s.id, parseInt(e.target.value))}>
                        <option value="">Triase</option>
                        <option value={1}>Level 1 (Kritis)</option>
                        <option value={2}>Level 2 (Darurat)</option>
                        <option value={3}>Level 3 (Segera)</option>
                        <option value={4}>Level 4 (Non-darurat)</option>
                        <option value={5}>Level 5 (Ringan)</option>
                      </select>
                      {s.status !== 'discharged' && (
                        <button className="btn btn-success btn-sm" onClick={() => dischargePatient(s.id)}>
                          Selesai
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
