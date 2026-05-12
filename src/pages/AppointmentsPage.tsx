import { useEffect, useState } from 'react'
import axios from 'axios'

type Appointment = {
  id: string | number
  status?: string
  patient_name?: string
  patient?: { name?: string }
  doctor_name?: string
  doctor?: { name?: string }
  date?: string
  time?: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => { fetchAppointments() }, [])

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/v1/appointments')
      setAppointments(res.data.appointments || res.data || [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string | number, status: string) => {
    try {
      await axios.put(`/api/v1/appointments/${id}`, { status })
      fetchAppointments()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal update status')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const filtered = filter ? appointments.filter(a => a.status === filter) : appointments

  const statusBadge = (status?: string) => {
    const map: Record<string, string> = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    }
    return `badge ${map[status || ''] || 'badge-gray'}`
  }

  return (
    <div>
      <div className="page-header">
        <h1>📋 Janji Temu</h1>
        <div className="flex gap-2">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(s)}>
              {s || 'Semua'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pasien</th>
                <th>Dokter</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray" style={{ padding: '2rem' }}>Tidak ada janji temu</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td className="font-semibold">{a.patient_name || a.patient?.name || 'Pasien'}</td>
                  <td>{a.doctor_name || a.doctor?.name || '-'}</td>
                  <td>{a.date ? new Date(a.date).toLocaleDateString('id-ID') : '-'}</td>
                  <td>{a.time || '-'}</td>
                  <td><span className={statusBadge(a.status)}>{a.status}</span></td>
                  <td>
                    <div className="flex gap-2">
                      {a.status === 'pending' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(a.id, 'confirmed')}>Konfirmasi</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a.id, 'cancelled')}>Tolak</button>
                        </>
                      )}
                      {a.status === 'confirmed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a.id, 'completed')}>Selesai</button>
                      )}
                      {(a.status === 'completed' || a.status === 'cancelled') && (
                        <span className="text-xs text-gray">Tidak ada aksi</span>
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
