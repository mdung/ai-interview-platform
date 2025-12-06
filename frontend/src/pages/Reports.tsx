import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsApi } from '../services/api'
import { useToast, PageLayout } from '../components'
import './Reports.css'

const Reports = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [generating, setGenerating] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  const handleGenerateReport = async (type: 'dashboard' | 'interviews' | 'candidates', format: 'pdf' | 'csv') => {
    setGenerating(`${type}-${format}`)
    try {
      let response
      if (type === 'dashboard' && format === 'pdf') {
        response = await analyticsApi.exportDashboardPdf()
      } else if (type === 'dashboard' && format === 'csv') {
        response = await analyticsApi.exportDashboardCsv()
      } else if (type === 'interviews' && format === 'pdf') {
        response = await analyticsApi.exportInterviewPdf()
      } else if (type === 'candidates' && format === 'pdf') {
        response = await analyticsApi.exportCandidatePdf()
      }

      if (response) {
        const blob = new Blob([response.data], {
          type: format === 'pdf' ? 'application/pdf' : 'text/csv',
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        showToast('Report generated and downloaded successfully', 'success')
      }
    } catch (err: any) {
      showToast('Failed to generate report', 'error')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <PageLayout
      title="Reports & Exports"
      actions={
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      }
    >
      <div className="reports-container">

      <div className="reports-content">
        <div className="reports-section">
          <h2>Dashboard Reports</h2>
          <p className="section-description">
            Generate comprehensive dashboard reports with overall statistics and metrics.
          </p>
          <div className="report-cards">
            <div className="report-card">
              <h3>Dashboard PDF Report</h3>
              <p>Complete dashboard statistics in PDF format</p>
              <button
                className="btn btn-primary"
                onClick={() => handleGenerateReport('dashboard', 'pdf')}
                disabled={generating === 'dashboard-pdf'}
              >
                {generating === 'dashboard-pdf' ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
            <div className="report-card">
              <h3>Dashboard CSV Report</h3>
              <p>Dashboard data in CSV format for analysis</p>
              <button
                className="btn btn-primary"
                onClick={() => handleGenerateReport('dashboard', 'csv')}
                disabled={generating === 'dashboard-csv'}
              >
                {generating === 'dashboard-csv' ? 'Generating...' : 'Generate CSV'}
              </button>
            </div>
          </div>
        </div>

        <div className="reports-section">
          <h2>Interview Reports</h2>
          <p className="section-description">
            Generate detailed reports on interview performance and statistics.
          </p>
          <div className="report-cards">
            <div className="report-card">
              <h3>Interview Analytics PDF</h3>
              <p>Comprehensive interview statistics and analysis</p>
              <button
                className="btn btn-primary"
                onClick={() => handleGenerateReport('interviews', 'pdf')}
                disabled={generating === 'interviews-pdf'}
              >
                {generating === 'interviews-pdf' ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
          </div>
        </div>

        <div className="reports-section">
          <h2>Candidate Reports</h2>
          <p className="section-description">
            Generate reports on candidate performance and metrics.
          </p>
          <div className="report-cards">
            <div className="report-card">
              <h3>Candidate Analytics PDF</h3>
              <p>Detailed candidate performance analysis</p>
              <button
                className="btn btn-primary"
                onClick={() => handleGenerateReport('candidates', 'pdf')}
                disabled={generating === 'candidates-pdf'}
              >
                {generating === 'candidates-pdf' ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
          </div>
        </div>

        <div className="reports-section">
          <h2>Date Range Filter</h2>
          <p className="section-description">
            Filter reports by date range (applied to future report generation).
          </p>
          <div className="date-range-filters">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="input"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                className="input"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageLayout>
  )
}

export default Reports


