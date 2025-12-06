import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsApi } from '../services/api'
import { 
  LineChartComponent, 
  BarChartComponent, 
  PieChartComponent,
  DatePicker,
  FilterPanel,
  Filter,
  LoadingSpinner,
  ErrorDisplay,
  useToast
} from '../components'
import './AdvancedAnalytics.css'

const AdvancedAnalytics = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  })
  
  const [filters, setFilters] = useState<Record<string, any>>({
    metric: 'interviews',
    period: 'daily',
    groupBy: 'status'
  })
  
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [trendData, setTrendData] = useState<any>(null)
  const [distributionData, setDistributionData] = useState<any>(null)
  const [performanceData, setPerformanceData] = useState<any>(null)

  useEffect(() => {
    loadAnalytics()
  }, [dateRange, filters])

  const loadAnalytics = async () => {
    setLoading(true)
    setError('')
    try {
      const days = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const [trendsRes, interviewsRes, candidatesRes] = await Promise.all([
        analyticsApi.getTrends({
          metric: filters.metric,
          period: filters.period,
          days: days
        }),
        analyticsApi.getInterviewAnalytics(),
        analyticsApi.getCandidateAnalytics()
      ])
      
      setTrendData(trendsRes.data)
      setComparisonData({
        interviews: interviewsRes.data,
        candidates: candidatesRes.data
      })
      
      // Process distribution data
      if (interviewsRes.data?.interviewsByStatus) {
        setDistributionData(
          Object.entries(interviewsRes.data.interviewsByStatus).map(([status, count]) => ({
            name: status,
            value: count
          }))
        )
      }
      
      // Process performance data
      if (interviewsRes.data) {
        setPerformanceData([
          {
            name: 'Average Duration',
            value: interviewsRes.data.averageInterviewDuration || 0
          },
          {
            name: 'Average Turns',
            value: interviewsRes.data.averageTurnsPerInterview || 0
          },
          {
            name: 'Completion Rate',
            value: interviewsRes.data.averageCompletionRate || 0
          }
        ])
      }
    } catch (err: any) {
      setError('Failed to load analytics data')
      showToast('Failed to load analytics', 'error')
    } finally {
      setLoading(false)
    }
  }

  const analyticsFilters: Filter[] = [
    {
      key: 'metric',
      label: 'Metric',
      type: 'select',
      options: [
        { label: 'Interviews', value: 'interviews' },
        { label: 'Candidates', value: 'candidates' },
        { label: 'Completion Rate', value: 'completion' },
        { label: 'Average Score', value: 'score' }
      ]
    },
    {
      key: 'period',
      label: 'Period',
      type: 'select',
      options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' }
      ]
    },
    {
      key: 'groupBy',
      label: 'Group By',
      type: 'select',
      options: [
        { label: 'Status', value: 'status' },
        { label: 'Template', value: 'template' },
        { label: 'Candidate', value: 'candidate' },
        { label: 'Date', value: 'date' }
      ]
    }
  ]

  const handleExport = async (type: string, format: 'pdf' | 'csv') => {
    try {
      let response
      if (type === 'trends' && format === 'pdf') {
        response = await analyticsApi.exportInterviewPdf()
      } else if (type === 'trends' && format === 'csv') {
        response = await analyticsApi.exportDashboardCsv()
      } else {
        response = await analyticsApi.exportDashboardPdf()
      }

      if (response) {
        const blob = new Blob([response.data], {
          type: format === 'pdf' ? 'application/pdf' : 'text/csv',
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `advanced_analytics_${type}_${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        showToast(`Analytics exported as ${format.toUpperCase()}`, 'success')
      }
    } catch (err) {
      showToast('Failed to export analytics', 'error')
    }
  }

  return (
    <div className="advanced-analytics-container">
      <div className="advanced-analytics-header">
        <h1>Advanced Analytics</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/recruiter/analytics')}>
            Basic Analytics
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      {error && <ErrorDisplay error={error} />}

      {/* Date Range Selection */}
      <div className="analytics-filters-section">
        <div className="date-range-selector">
          <div className="date-range-item">
            <label>Start Date</label>
            <DatePicker
              value={dateRange.startDate}
              onChange={(date) => date && setDateRange({ ...dateRange, startDate: date })}
            />
          </div>
          <div className="date-range-item">
            <label>End Date</label>
            <DatePicker
              value={dateRange.endDate}
              onChange={(date) => date && setDateRange({ ...dateRange, endDate: date })}
            />
          </div>
        </div>
        
        <FilterPanel
          filters={analyticsFilters}
          onFilterChange={setFilters}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading advanced analytics..." />
      ) : (
        <div className="analytics-charts-grid">
          {/* Trend Analysis */}
          {trendData && trendData.dataPoints && trendData.dataPoints.length > 0 && (
            <div className="analytics-chart-card">
              <div className="chart-header">
                <h2>Trend Analysis</h2>
                <div className="chart-actions">
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => handleExport('trends', 'pdf')}
                  >
                    Export PDF
                  </button>
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => handleExport('trends', 'csv')}
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <LineChartComponent
                data={trendData.dataPoints.map((point: any) => ({
                  name: point.date,
                  value: point.value,
                  change: point.percentageChange || 0
                }))}
                dataKeys={['value']}
                title="Trend Over Time"
              />
            </div>
          )}

          {/* Distribution Chart */}
          {distributionData && distributionData.length > 0 && (
            <div className="analytics-chart-card">
              <div className="chart-header">
                <h2>Distribution Analysis</h2>
              </div>
              <PieChartComponent
                data={distributionData}
                title="Status Distribution"
              />
            </div>
          )}

          {/* Performance Metrics */}
          {performanceData && performanceData.length > 0 && (
            <div className="analytics-chart-card">
              <div className="chart-header">
                <h2>Performance Metrics</h2>
              </div>
              <BarChartComponent
                data={performanceData}
                dataKeys={['value']}
                title="Key Performance Indicators"
              />
            </div>
          )}

          {/* Comparison Data */}
          {comparisonData && (
            <div className="analytics-chart-card">
              <div className="chart-header">
                <h2>Comparison Analysis</h2>
              </div>
              <div className="comparison-stats">
                <div className="comparison-item">
                  <h3>Total Interviews</h3>
                  <p className="comparison-value">
                    {comparisonData.interviews?.totalInterviews || 0}
                  </p>
                </div>
                <div className="comparison-item">
                  <h3>Total Candidates</h3>
                  <p className="comparison-value">
                    {comparisonData.candidates?.totalCandidates || 0}
                  </p>
                </div>
                <div className="comparison-item">
                  <h3>Completion Rate</h3>
                  <p className="comparison-value">
                    {comparisonData.interviews?.averageCompletionRate?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="comparison-item">
                  <h3>Average Score</h3>
                  <p className="comparison-value">
                    {comparisonData.candidates?.averageScore?.toFixed(1) || 0}/10
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Statistics */}
          {comparisonData && (
            <div className="analytics-chart-card">
              <div className="chart-header">
                <h2>Detailed Statistics</h2>
              </div>
              <div className="detailed-stats">
                <div className="stat-row">
                  <span className="stat-label">Completed Interviews:</span>
                  <span className="stat-value">
                    {comparisonData.interviews?.completedInterviews || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">In Progress:</span>
                  <span className="stat-value">
                    {comparisonData.interviews?.inProgressInterviews || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Average Duration:</span>
                  <span className="stat-value">
                    {comparisonData.interviews?.averageInterviewDuration?.toFixed(1) || 0} min
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Average Turns:</span>
                  <span className="stat-value">
                    {comparisonData.interviews?.averageTurnsPerInterview?.toFixed(1) || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Candidates with Interviews:</span>
                  <span className="stat-value">
                    {comparisonData.candidates?.candidatesWithInterviews || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Candidates with Resumes:</span>
                  <span className="stat-value">
                    {comparisonData.candidates?.candidatesWithResumes || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedAnalytics


