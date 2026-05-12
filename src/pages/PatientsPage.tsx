import { useEffect, useState } from 'react'
import axios from 'axios'

type Patient = {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  created_at?: string
  medical_record_number?: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPatients() }, [])

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/v1/patients')
      setPatients(res.data.patients || res.data || [])
    } catch {
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>🧑‍🤝‍🧑 Daftar Pasien</h1>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No RM</th>
                <th>Nama</th>
                <th>Telepon</th>
                <th>Email</th>
                <th>Alamat</th>
                <th>Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray" style={{ padding: '2rem' }}>Belum ada pasien</td></tr>
              ) : patients.map(p => (
                <tr key={p.id}>
                  <td className="font-semibold">{p.medical_record_number || p.id?.substring(0, 8) || '-'}</td>
                  <td>{p.name}</td>
                  <td className="text-gray">{p.phone || '-'}</td>
                  <td className="text-gray">{p.email || '-'}</td>
                  <td className="text-sm text-gray truncate" style={{ maxWidth: 200 }}>{p.address || '-'}</td>
                  <td className="text-xs text-gray">{p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
