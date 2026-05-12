import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Stats = {
  totalDoctors: number
  totalAppointments: number
  totalPatients: number
  todayAppointments: number
  pendingAppointments: number
  emergencyActive: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/v1/dashboard/stats')
        setStats(res.data)
      } catch (err) {
        setStats({
          totalDoctors: 0, totalAppointments: 0, totalPatients: 0,
          todayAppointments: 0, pendingAppointments: 0, emergencyActive: 0,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const statCards = [
    { title: 'Total Dokter', value: stats?.totalDoctors || 0, icon: '👨‍⚕️', color: 'blue' },
    { title: 'Janji Temu Hari Ini', value: stats?.todayAppointments || 0, icon: '📅', color: 'green' },
    { title: 'Menunggu Konfirmasi', value: stats?.pendingAppointments || 0, icon: '⏳', color: 'yellow' },
    { title: 'Total Pasien', value: stats?.totalPatients || 0, icon: '🧑‍🤝‍🧑', color: 'purple' },
    { title: 'Total Kunjungan', value: stats?.totalAppointments || 0, icon: '📋', color: 'blue' },
    { title: 'IGD Aktif', value: stats?.emergencyActive || 0, icon: '🚑', color: 'red' },
  ]

  const chartData: Array<{ name: string; kunjungan: number }> = [
    { name: 'Sen', kunjungan: 12 },
    { name: 'Sel', kunjungan: 18 },
    { name: 'Rab', kunjungan: 15 },
    { name: 'Kam', kunjungan: 22 },
    { name: 'Jum', kunjungan: 20 },
    { name: 'Sab', kunjungan: 8 },
    { name: 'Min', kunjungan: 5 },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className="text-sm text-gray">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>📈 Kunjungan Pekan Ini</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="kunjungan" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
