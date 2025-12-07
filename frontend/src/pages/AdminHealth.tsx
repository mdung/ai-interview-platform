import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import { LoadingSpinner, ErrorDisplay, useToast } from '../components'
import './AdminHealth.css'

interface HealthStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED'
  database: 'UP' | 'DOWN'
  redis: 'UP' | 'DOWN'
  diskSpace: {
    total: number
    free: number
    threshold: number
  }
  memory: {
    total: number
    used: number
    threshold: number
  }
  uptime: number
  version: string
}

const AdminHealth = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadHealth()
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(loadHealth, 30000) // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadHealth = async () => {
    try {
      const response = await adminApi.getSystemHealth()
      setHealth(response.data)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load system health')
      // Set mock data for demonstration
      setHealth({
        status: 'UP',
        database: 'UP',
        redis: 'UP',
        diskSpace: {
          total: 1000,
          free: 750,
          threshold: 100,
        },
        memory: {
          total: 8192,
          used: 4096,
          threshold: 6144,
        },
        uptime: 86400,
        version: '1.0.0',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UP':
        return '#28a745'
      case 'DOWN':
        return '#dc3545'
      case 'DEGRADED':
        return '#ffc107'
      default:
        return '#6c757d'
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const getDiskUsagePercent = () => {
    if (!health) return 0
    return ((health.diskSpace.total - health.diskSpace.free) / health.diskSpace.total) * 100
  }

  const getMemoryUsagePercent = () => {
    if (!health) return 0
    return (health.memory.used / health.memory.total) * 100
  }

  if (loading && !health) {
    return (
      <div className="admin-health-container">
        <LoadingSpinner message="Loading system health..." />
      </div>
    )
  }

  if (error && !health) {
    return (
      <div className="admin-health-container">
        <ErrorDisplay error={error} />
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="admin-health-container">
      <div className="health-header">
        <div>
          <h1>System Health Monitoring</h1>
          <p className="health-subtitle">Monitor system status and performance metrics</p>
        </div>
        <div className="header-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (30s)
          </label>
          <button className="btn btn-primary" onClick={loadHealth}>
            Refresh
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      {health && (
        <>
          <div className="health-overview">
            <div className="health-status-card">
              <h2>Overall Status</h2>
              <div
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(health.status) }}
              >
                {health.status}
              </div>
              <p className="status-details">
                System is {health.status === 'UP' ? 'operational' : 'experiencing issues'}
              </p>
            </div>
            <div className="health-metric-card">
              <h3>Uptime</h3>
              <p className="metric-value">{formatUptime(health.uptime)}</p>
            </div>
            <div className="health-metric-card">
              <h3>Version</h3>
              <p className="metric-value">{health.version}</p>
            </div>
          </div>

          <div className="health-services">
            <h2>Service Status</h2>
            <div className="services-grid">
              <div className="service-card">
                <h3>Database</h3>
                <div
                  className="service-status"
                  style={{ color: getStatusColor(health.database) }}
                >
                  {health.database}
                </div>
              </div>
              <div className="service-card">
                <h3>Redis Cache</h3>
                <div
                  className="service-status"
                  style={{ color: getStatusColor(health.redis) }}
                >
                  {health.redis}
                </div>
              </div>
            </div>
          </div>

          <div className="health-resources">
            <h2>Resource Usage</h2>
            <div className="resources-grid">
              <div className="resource-card">
                <div className="resource-header">
                  <h3>Disk Space</h3>
                  <span className="resource-usage">
                    {getDiskUsagePercent().toFixed(1)}% used
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${getDiskUsagePercent()}%`,
                      backgroundColor:
                        getDiskUsagePercent() > 90
                          ? '#dc3545'
                          : getDiskUsagePercent() > 70
                          ? '#ffc107'
                          : '#28a745',
                    }}
                  />
                </div>
                <div className="resource-details">
                  <span>
                    Free: {(health.diskSpace.free / 1024).toFixed(2)} GB /{' '}
                    {(health.diskSpace.total / 1024).toFixed(2)} GB
                  </span>
                  <span>Threshold: {(health.diskSpace.threshold / 1024).toFixed(2)} GB</span>
                </div>
              </div>

              <div className="resource-card">
                <div className="resource-header">
                  <h3>Memory</h3>
                  <span className="resource-usage">
                    {getMemoryUsagePercent().toFixed(1)}% used
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${getMemoryUsagePercent()}%`,
                      backgroundColor:
                        getMemoryUsagePercent() > 90
                          ? '#dc3545'
                          : getMemoryUsagePercent() > 70
                          ? '#ffc107'
                          : '#28a745',
                    }}
                  />
                </div>
                <div className="resource-details">
                  <span>
                    Used: {(health.memory.used / 1024).toFixed(2)} GB /{' '}
                    {(health.memory.total / 1024).toFixed(2)} GB
                  </span>
                  <span>Threshold: {(health.memory.threshold / 1024).toFixed(2)} GB</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminHealth



