import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

type Message = { type: 'success' | 'error'; text: string }

export default function SettingsPage() {
  const { user } = useAuth()
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await axios.put('/api/v1/auth/profile', profileForm)
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui' })
      if (user) {
        const updated = { ...user, ...profileForm }
        localStorage.setItem('user', JSON.stringify(updated))
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Gagal update profil' })
    } finally { setSaving(false) }
  }

  const changePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok' })
      return
    }
    if (passwordForm.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await axios.put('/api/v1/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      setMessage({ type: 'success', text: 'Password berhasil diubah' })
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Gagal ganti password' })
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Pengaturan</h1>
      </div>

      {message && (
        <div className="login-error" style={{ background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#16a34a' : '#dc2626', marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h3>👤 Profil Saya</h3></div>
          <div className="card-body">
            <form onSubmit={updateProfile}>
              <div className="form-group">
                <label className="form-label">Nama</label>
                <input className="form-input" value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email || ''} disabled style={{ background: '#f3f4f6' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Telepon</label>
                <input className="form-input" value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Alamat</label>
                <textarea className="form-textarea" value={profileForm.address}
                  onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} rows={3} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>🔑 Ganti Password</h3></div>
          <div className="card-body">
            <form onSubmit={changePassword}>
              <div className="form-group">
                <label className="form-label">Password Saat Ini</label>
                <input className="form-input" type="password" value={passwordForm.current_password}
                  onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password Baru</label>
                  <input className="form-input" type="password" value={passwordForm.new_password}
                    onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Konfirmasi</label>
                  <input className="form-input" type="password" value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn btn-warning" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Ganti Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
