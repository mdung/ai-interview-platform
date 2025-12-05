import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { candidateApi } from '../services/api'
import './CandidateForm.css'

const CandidateForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    linkedInUrl: '',
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  useEffect(() => {
    if (id) {
      loadCandidate()
    }
  }, [id])

  const loadCandidate = async () => {
    try {
      const response = await candidateApi.getCandidateById(parseInt(id!))
      setFormData({
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        phoneNumber: response.data.phoneNumber || '',
        linkedInUrl: response.data.linkedInUrl || '',
      })
    } catch (err: any) {
      setError('Failed to load candidate')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (id) {
        await candidateApi.updateCandidate(parseInt(id), formData)
        if (resumeFile) {
          await candidateApi.uploadResume(parseInt(id), resumeFile)
        }
      } else {
        const response = await candidateApi.createCandidate(formData)
        if (resumeFile && response.data.id) {
          await candidateApi.uploadResume(response.data.id, resumeFile)
        }
      }
      navigate('/recruiter/candidates')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save candidate')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  return (
    <div className="candidate-form-container">
      <div className="candidate-form-header">
        <h1>{id ? 'Edit Candidate' : 'Add New Candidate'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="candidate-form">
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            className="input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            className="input"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            className="input"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            className="input"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>LinkedIn URL</label>
          <input
            type="url"
            className="input"
            value={formData.linkedInUrl}
            onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Resume</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="input"
          />
          {resumeFile && (
            <p className="file-name">Selected: {resumeFile.name}</p>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Candidate' : 'Create Candidate'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CandidateForm

