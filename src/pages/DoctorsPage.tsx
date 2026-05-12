import { useEffect, useState } from 'react'
import axios from 'axios'

type Doctor = {
  id: string | number
  name: string
  specialty: string
  phone?: string
  email?: string
  schedule?: string
}

type DoctorForm = {
  name: string
  specialty: string
  phone: string
  email: string
  schedule: string
}

type ModalState = { mode: 'add' | 'edit'; id?: Doctor['id'] } | null

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>(null)
  const [form, setForm] = useState<DoctorForm>({ name: '', specialty: '', phone: '', email: '', schedule: '' })

  useEffect(() => { fetchDoctors() }, [])

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/v1/doctors')
      setDoctors(res.data.doctors || res.data || [])
    } catch {
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setForm({ name: '', specialty: '', phone: '', email: '', schedule: '' })
    setModal({ mode: 'add' })
  }

  const openEdit = (doc: Doctor) => {
    setForm({ name: doc.name, specialty: doc.specialty, phone: doc.phone || '', email: doc.email || '', schedule: doc.schedule || '' })
    setModal({ mode: 'edit', id: doc.id })
  }

  const handleSave = async () => {
    if (!modal) return
    try {
      if (modal.mode === 'add') {
        await axios.post('/api/v1/doctors', form)
      } else {
        await axios.put(`/api/v1/doctors/${modal.id}`, form)
      }
      setModal(null)
      fetchDoctors()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menyimpan')
    }
  }

  const handleDelete = async (id: Doctor['id']) => {
    if (!confirm('Hapus dokter ini?')) return
    try {
      await axios.delete(`/api/v1/doctors/${id}`)
      fetchDoctors()
    } catch {
      alert('Gagal menghapus')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>👨‍⚕️ Daftar Dokter</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Tambah Dokter</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Spesialisasi</th>
                <th>Telepon</th>
                <th>Email</th>
                <th>Jadwal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray" style={{ padding: '2rem' }}>Belum ada data dokter</td></tr>
              ) : doctors.map(doc => (
                <tr key={doc.id}>
                  <td className="font-semibold">{doc.name}</td>
                  <td><span className="badge badge-info">{doc.specialty}</span></td>
                  <td className="text-gray">{doc.phone || '-'}</td>
                  <td className="text-gray">{doc.email || '-'}</td>
                  <td className="text-sm">{doc.schedule || '-'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(doc)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc.id)}>Hapus</button>
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
              <h3>{modal.mode === 'add' ? 'Tambah Dokter' : 'Edit Dokter'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama dokter" />
              </div>
              <div className="form-group">
                <label className="form-label">Spesialisasi</label>
                <select className="form-select" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}>
                  <option value="">Pilih spesialisasi</option>
                  <option value="Umum">Umum</option>
                  <option value="Jantung">Jantung</option>
                  <option value="Anak">Anak</option>
                  <option value="Gigi">Gigi</option>
                  <option value="Saraf">Saraf</option>
                  <option value="Kandungan">Kandungan</option>
                  <option value="Mata">Mata</option>
                  <option value="THT">THT</option>
                  <option value="Kulit">Kulit</option>
                  <option value="Penyakit Dalam">Penyakit Dalam</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telepon</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0812..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="dokter@email.com" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Jadwal Praktik</label>
                <input className="form-input" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} placeholder="Sen-Jum 08:00-16:00" />
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
