import { useEffect, useState } from 'react'
import axios from 'axios'

type AuditLog = {
  id: string | number
  created_at?: string
  user_name?: string
  user?: { name?: string }
  action?: string
  details?: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLogs() }, [])

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/v1/audit-logs')
      setLogs(res.data.logs || res.data || [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>📝 Log Aktivitas</h1>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>User</th>
                <th>Aksi</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray" style={{ padding: '2rem' }}>Belum ada log aktivitas</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td className="text-xs text-gray">{log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-'}</td>
                  <td className="text-sm">{log.user_name || log.user?.name || '-'}</td>
                  <td>
                    <span className={`badge ${
                      log.action?.includes('delete') || log.action?.includes('hapus') ? 'badge-danger' :
                      log.action?.includes('create') || log.action?.includes('tambah') ? 'badge-success' :
                      log.action?.includes('update') || log.action?.includes('edit') ? 'badge-info' : 'badge-gray'
                    }`}>{log.action || '-'}</span>
                  </td>
                  <td className="text-sm text-gray">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
