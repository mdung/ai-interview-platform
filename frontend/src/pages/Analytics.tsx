import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsApi } from '../services/api'
import './Analytics.css'

const Analytics = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'interviews' | 'candidates' | 'trends'>('overview')
  const [overview, setOverview] = useState<any>(null)
  const [interviewAnalytics, setInterviewAnalytics] = useState<any>(null)
  const [candidateAnalytics, setCandidateAnalytics] = useState<any>(null)
  const [trends, setTrends] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOverview()
  }, [])

  useEffect(() => {
    if (activeTab === 'interviews') {
      loadInterviewAnalytics()
    } else if (activeTab === 'candidates') {
      loadCandidateAnalytics()
    } else if (activeTab === 'trends') {
      loadTrends()
    }
  }, [activeTab])

  const loadOverview = async () => {
    try {
      const response = await analyticsApi.getDashboardOverview()
      setOverview(response.data)
    } catch (err) {
      console.error('Failed to load overview')
    } finally {
      setLoading(false)
    }
  }

  const loadInterviewAnalytics = async () => {
    try {
      const response = await analyticsApi.getInterviewAnalytics()
      setInterviewAnalytics(response.data)
    } catch (err) {
      console.error('Failed to load interview analytics')
    }
  }

  const loadCandidateAnalytics = async () => {
    try {
      const response = await analyticsApi.getCandidateAnalytics()
      setCandidateAnalytics(response.data)
    } catch (err) {
      console.error('Failed to load candidate analytics')
    }
  }

  const loadTrends = async () => {
    try {
      const response = await analyticsApi.getTrends({ metric: 'interviews', period: 'daily', days: 30 })
      setTrends(response.data)
    } catch (err) {
      console.error('Failed to load trends')
    }
  }

  const handleExport = async (type: 'dashboard' | 'interviews' | 'candidates', format: 'pdf' | 'csv') => {
    try {
      let response
      if (type === 'dashboard' && format === 'pdf') {
        response = await analyticsApi.exportDashboardPdf()
      } else if (type === 'dashboard' && format === 'csv') {
        response = await analyticsApi.exportDashboardCsv()
      } else if (type === 'interviews') {
        response = await analyticsApi.exportInterviewPdf()
      } else if (type === 'candidates') {
        response = await analyticsApi.exportCandidatePdf()
      }

      if (response) {
        const blob = new Blob([response.data], {
          type: format === 'pdf' ? 'application/pdf' : 'text/csv',
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${type}_report.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      alert('Failed to export report')
    }
  }

  if (loading) {
    return <div className="loading">Loading analytics...</div>
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>Analytics & Reports</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="analytics-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'interviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('interviews')}
        >
          Interview Analytics
        </button>
        <button
          className={`tab ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          Candidate Analytics
        </button>
        <button
          className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && overview && (
          <div className="analytics-panel">
            <div className="panel-header">
              <h2>Dashboard Overview</h2>
              <div className="export-buttons">
                <button className="btn btn-small btn-primary" onClick={() => handleExport('dashboard', 'pdf')}>
                  Export PDF
                </button>
                <button className="btn btn-small btn-primary" onClick={() => handleExport('dashboard', 'csv')}>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Candidates</h3>
                <p className="stat-value">{overview.totalCandidates}</p>
              </div>
              <div className="stat-card">
                <h3>Total Jobs</h3>
                <p className="stat-value">{overview.totalJobs}</p>
              </div>
              <div className="stat-card">
                <h3>Total Interviews</h3>
                <p className="stat-value">{overview.totalInterviews}</p>
              </div>
              <div className="stat-card">
                <h3>Completion Rate</h3>
                <p className="stat-value">{overview.completionRate?.toFixed(1)}%</p>
              </div>
              <div className="stat-card">
                <h3>Active Interviews</h3>
                <p className="stat-value">{overview.activeInterviews}</p>
              </div>
              <div className="stat-card">
                <h3>Completed Interviews</h3>
                <p className="stat-value">{overview.completedInterviews}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interviews' && interviewAnalytics && (
          <div className="analytics-panel">
            <div className="panel-header">
              <h2>Interview Analytics</h2>
              <button className="btn btn-small btn-primary" onClick={() => handleExport('interviews', 'pdf')}>
                Export PDF
              </button>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Interviews</h3>
                <p className="stat-value">{interviewAnalytics.totalInterviews}</p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-value">{interviewAnalytics.completedInterviews}</p>
              </div>
              <div className="stat-card">
                <h3>In Progress</h3>
                <p className="stat-value">{interviewAnalytics.inProgressInterviews}</p>
              </div>
              <div className="stat-card">
                <h3>Average Duration</h3>
                <p className="stat-value">{interviewAnalytics.averageInterviewDuration?.toFixed(1)} min</p>
              </div>
              <div className="stat-card">
                <h3>Average Turns</h3>
                <p className="stat-value">{interviewAnalytics.averageTurnsPerInterview?.toFixed(1)}</p>
              </div>
              <div className="stat-card">
                <h3>Completion Rate</h3>
                <p className="stat-value">{interviewAnalytics.averageCompletionRate?.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && candidateAnalytics && (
          <div className="analytics-panel">
            <div className="panel-header">
              <h2>Candidate Analytics</h2>
              <button className="btn btn-small btn-primary" onClick={() => handleExport('candidates', 'pdf')}>
                Export PDF
              </button>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Candidates</h3>
                <p className="stat-value">{candidateAnalytics.totalCandidates}</p>
              </div>
              <div className="stat-card">
                <h3>With Interviews</h3>
                <p className="stat-value">{candidateAnalytics.candidatesWithInterviews}</p>
              </div>
              <div className="stat-card">
                <h3>With Resumes</h3>
                <p className="stat-value">{candidateAnalytics.candidatesWithResumes}</p>
              </div>
              <div className="stat-card">
                <h3>Average Score</h3>
                <p className="stat-value">{candidateAnalytics.averageScore?.toFixed(1)}/10</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && trends && (
          <div className="analytics-panel">
            <h2>Trend Analysis</h2>
            <div className="trends-list">
              {trends.dataPoints?.map((point: any, index: number) => (
                <div key={index} className="trend-item">
                  <span className="trend-date">{point.date}</span>
                  <span className="trend-value">{point.value}</span>
                  {point.percentageChange !== null && (
                    <span className={`trend-change ${point.percentageChange >= 0 ? 'positive' : 'negative'}`}>
                      {point.percentageChange >= 0 ? '+' : ''}{point.percentageChange?.toFixed(1)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics

