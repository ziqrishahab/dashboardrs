import { useEffect, useState } from 'react'
import axios from 'axios'

type Schedule = {
  id: string | number
  doctor_id: string
  day: string
  time_start: string
  time_end: string
  room?: string
}

type Doctor = {
  id: string
  name: string
  specialty?: string
}

type ScheduleForm = {
  doctor_id: string
  day: string
  time_start: string
  time_end: string
  room: string
}

type ModalState = { mode: 'add' | 'edit'; id?: Schedule['id'] } | null

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>(null)
  const [form, setForm] = useState<ScheduleForm>({ doctor_id: '', day: '', time_start: '', time_end: '', room: '' })

  useEffect(() => { Promise.all([fetchSchedules(), fetchDoctors()]).then(() => setLoading(false)) }, [])

  const fetchSchedules = async () => {
    try { const res = await axios.get('/api/v1/schedules'); setSchedules(res.data.schedules || res.data || []) } catch { setSchedules([]) }
  }
  const fetchDoctors = async () => {
    try { const res = await axios.get('/api/v1/doctors'); setDoctors(res.data.doctors || res.data || []) } catch { setDoctors([]) }
  }

  const openAdd = () => {
    setForm({ doctor_id: '', day: 'Senin', time_start: '08:00', time_end: '12:00', room: '' })
    setModal({ mode: 'add' })
  }

  const openEdit = (s: Schedule) => {
    setForm({ doctor_id: s.doctor_id, day: s.day, time_start: s.time_start, time_end: s.time_end, room: s.room || '' })
    setModal({ mode: 'edit', id: s.id })
  }

  const handleSave = async () => {
    if (!modal) return
    try {
      if (modal.mode === 'add') await axios.post('/api/v1/schedules', form)
      else await axios.put(`/api/v1/schedules/${modal.id}`, form)
      setModal(null); fetchSchedules()
    } catch (err: any) { alert(err.response?.data?.error || 'Gagal menyimpan') }
  }

  const handleDelete = async (id: Schedule['id']) => {
    if (!confirm('Hapus jadwal ini?')) return
    try { await axios.delete(`/api/v1/schedules/${id}`); fetchSchedules() } catch { alert('Gagal menghapus') }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

  const getDoctorName = (id: string) => doctors.find(d => d.id === id)?.name || 'Unknown'

  return (
    <div>
      <div className="page-header">
        <h1>📅 Jadwal Dokter</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Tambah Jadwal</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Dokter</th>
                <th>Hari</th>
                <th>Jam Mulai</th>
                <th>Jam Selesai</th>
                <th>Ruangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray" style={{ padding: '2rem' }}>Belum ada jadwal</td></tr>
              ) : schedules.map(s => (
                <tr key={s.id}>
                  <td className="font-semibold">{getDoctorName(s.doctor_id)}</td>
                  <td>{s.day}</td>
                  <td>{s.time_start}</td>
                  <td>{s.time_end}</td>
                  <td>{s.room || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Tambah Jadwal' : 'Edit Jadwal'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Dokter</label>
                <select className="form-select" value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })}>
                  <option value="">Pilih dokter</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hari</label>
                  <select className="form-select" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ruangan</label>
                  <input className="form-input" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="Ruang 101" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Jam Mulai</label>
                  <input className="form-input" type="time" value={form.time_start} onChange={e => setForm({ ...form, time_start: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Selesai</label>
                  <input className="form-input" type="time" value={form.time_end} onChange={e => setForm({ ...form, time_end: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
