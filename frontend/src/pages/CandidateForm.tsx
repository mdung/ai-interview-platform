import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { candidateApi } from '../services/api'
import { FileUpload, useToast, ErrorDisplay, PageLayout } from '../components'
import './CandidateForm.css'

const CandidateForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    linkedInUrl: '',
  })
  const [resumeFiles, setResumeFiles] = useState<File[]>([])

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
      let candidateId = id ? parseInt(id) : null
      
      if (id) {
        await candidateApi.updateCandidate(parseInt(id), formData)
        candidateId = parseInt(id)
      } else {
        const response = await candidateApi.createCandidate(formData)
        candidateId = response.data.id
      }
      
      if (resumeFiles.length > 0 && candidateId) {
        await candidateApi.uploadResume(candidateId, resumeFiles[0])
        showToast('Resume uploaded successfully', 'success')
      }
      
      showToast(id ? 'Candidate updated successfully' : 'Candidate created successfully', 'success')
      navigate('/recruiter/candidates')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to save candidate'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout
      title={id ? 'Edit Candidate' : 'Add New Candidate'}
    >
    <div className="candidate-form-container">

      {error && <ErrorDisplay error={error} />}

      <form onSubmit={handleSubmit} className="candidate-form">
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="Enter candidate email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            id="firstName"
            type="text"
            className="input"
            placeholder="Enter candidate first name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            id="lastName"
            type="text"
            className="input"
            placeholder="Enter candidate last name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            type="tel"
            className="input"
            placeholder="Enter phone number (optional)"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="linkedInUrl">LinkedIn URL</label>
          <input
            id="linkedInUrl"
            type="url"
            className="input"
            placeholder="https://linkedin.com/in/username (optional)"
            value={formData.linkedInUrl}
            onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Resume</label>
          <FileUpload
            accept=".pdf,.doc,.docx"
            multiple={false}
            maxSize={10}
            onFileSelect={(files) => setResumeFiles(files)}
            onError={(error) => {
              setError(error)
              showToast(error, 'error')
            }}
            label="Upload resume (PDF, DOC, DOCX - Max 10MB)"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Candidate' : 'Create Candidate'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/recruiter/candidates')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
    </PageLayout>
  )
}

export default CandidateForm

