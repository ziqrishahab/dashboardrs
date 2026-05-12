import { useEffect, useState } from 'react'
import axios from 'axios'

type StaffMember = {
  id: string | number
  name: string
  email: string
  phone?: string
  role: string
  is_active?: boolean
}

type StaffForm = {
  name: string
  email: string
  password: string
  phone: string
  role: string
}

type ModalState = { mode: 'add' | 'edit'; id?: StaffMember['id'] } | null

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>(null)
  const [form, setForm] = useState<StaffForm>({ name: '', email: '', password: '', phone: '', role: 'resepsionis' })

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/api/v1/auth/users')
      setStaff(res.data.users || res.data || [])
    } catch {
      setStaff([])
    } finally { setLoading(false) }
  }

  const openAdd = () => {
    setForm({ name: '', email: '', password: '', phone: '', role: 'resepsionis' })
    setModal({ mode: 'add' })
  }

  const handleSave = async () => {
    if (!modal) return
    try {
      if (modal.mode === 'add') {
        await axios.post('/api/v1/auth/register', form)
      } else {
        const { password, ...rest } = form
        await axios.put(`/api/v1/auth/users/${modal.id}`, password ? form : rest)
      }
      setModal(null)
      fetchStaff()
    } catch (err: any) { alert(err.response?.data?.error || 'Gagal menyimpan') }
  }

  const toggleActive = async (id: StaffMember['id'], current: boolean) => {
    try {
      await axios.put(`/api/v1/auth/users/${id}`, { is_active: !current })
      fetchStaff()
    } catch { alert('Gagal update status') }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const roleBadge = (role: string) => {
    const map: Record<string, string> = { admin: 'badge-danger', resepsionis: 'badge-info' }
    return `badge ${map[role] || 'badge-gray'}`
  }

  return (
    <div>
      <div className="page-header">
        <h1>👥 Manajemen Staff</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Tambah Staff</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Role</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray" style={{ padding: '2rem' }}>Belum ada staff</td></tr>
              ) : staff.map(s => (
                <tr key={s.id}>
                  <td className="font-semibold">{s.name}</td>
                  <td className="text-sm">{s.email}</td>
                  <td className="text-gray">{s.phone || '-'}</td>
                  <td><span className={roleBadge(s.role)}>{s.role}</span></td>
                  <td>
                    <span className={`badge ${s.is_active !== false ? 'badge-success' : 'badge-danger'}`}>
                      {s.is_active !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        setForm({ name: s.name, email: s.email, password: '', phone: s.phone || '', role: s.role })
                        setModal({ mode: 'edit', id: s.id })
                      }}>Edit</button>
                      <button className={`btn btn-sm ${s.is_active !== false ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleActive(s.id, s.is_active !== false)}>
                        {s.is_active !== false ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
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
              <h3>{modal.mode === 'add' ? 'Tambah Staff' : 'Edit Staff'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama staff" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@rs.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Telepon</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0812..." />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password {modal.mode === 'edit' && <span className="text-gray text-xs"> (kosongkan jika tidak diganti)</span>}</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 karakter" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="resepsionis">Resepsionis</option>
                  <option value="admin">Admin</option>
                </select>
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
