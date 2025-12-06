import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsApi, jobApi } from '../services/api'
import { LoadingSpinner, ErrorDisplay, PageLayout } from '../components'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './JobAnalytics.css'

const JobAnalytics = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [jobAnalytics, setJobAnalytics] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [analyticsRes, jobsRes] = await Promise.all([
        analyticsApi.getJobAnalytics(),
        jobApi.getAllJobs({ page: 0, size: 100 })
      ])
      setJobAnalytics(analyticsRes.data)
      setJobs(jobsRes.data.jobs || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title="Job Analytics">
        <LoadingSpinner message="Loading job analytics..." />
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Job Analytics">
        <ErrorDisplay error={error} />
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </PageLayout>
    )
  }

  const jobPerformanceData = jobAnalytics?.jobPerformance || []
  const jobStatusData = jobAnalytics?.jobsByStatus ? Object.entries(jobAnalytics.jobsByStatus).map(([status, count]) => ({
    status,
    count,
  })) : []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <PageLayout
      title="Job Analytics"
      actions={
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      }
    >
      <div className="job-analytics-container">

      <div className="analytics-stats">
        <div className="stat-card">
          <h3>Total Jobs</h3>
          <p className="stat-value">{jobAnalytics?.totalJobs || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <p className="stat-value">{jobAnalytics?.activeJobs || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Candidates</h3>
          <p className="stat-value">{jobAnalytics?.totalCandidates || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Interviews</h3>
          <p className="stat-value">{jobAnalytics?.totalInterviews || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Average Interviews per Job</h3>
          <p className="stat-value">
            {jobAnalytics?.averageInterviewsPerJob
              ? jobAnalytics.averageInterviewsPerJob.toFixed(1)
              : '0'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Average Completion Rate</h3>
          <p className="stat-value">
            {jobAnalytics?.averageCompletionRate
              ? `${jobAnalytics.averageCompletionRate.toFixed(1)}%`
              : '0%'}
          </p>
        </div>
      </div>

      <div className="analytics-charts">
        {jobStatusData.length > 0 && (
          <div className="chart-card">
            <h2>Jobs by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {jobPerformanceData.length > 0 && (
          <div className="chart-card">
            <h2>Top Performing Jobs</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobPerformanceData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jobTitle" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalInterviews" fill="#0088FE" name="Interviews" />
                <Bar dataKey="completedInterviews" fill="#00C49F" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {jobPerformanceData.length > 0 && (
          <div className="chart-card">
            <h2>Job Performance Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={jobPerformanceData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jobTitle" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#0088FE"
                  strokeWidth={2}
                  name="Average Score"
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#00C49F"
                  strokeWidth={2}
                  name="Completion Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {jobPerformanceData.length > 0 && (
        <div className="job-performance-table">
          <h2>Job Performance Details</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Total Interviews</th>
                  <th>Completed</th>
                  <th>Average Score</th>
                  <th>Completion Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobPerformanceData.map((job: any, index: number) => (
                  <tr key={index}>
                    <td>{job.jobTitle}</td>
                    <td>{job.totalInterviews}</td>
                    <td>{job.completedInterviews}</td>
                    <td>
                      {job.averageScore ? job.averageScore.toFixed(1) : 'N/A'}
                    </td>
                    <td>
                      {job.completionRate ? `${job.completionRate.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td>
                      <button
                        className="btn btn-small btn-primary"
                        onClick={() => {
                          const job = jobs.find(j => j.title === job.jobTitle)
                          if (job) {
                            navigate(`/recruiter/jobs/${job.id}`)
                          }
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </PageLayout>
  )
}

export default JobAnalytics


