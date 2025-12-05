import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { jobApi } from '../services/api'
import './JobForm.css'

const JobForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    seniorityLevel: 'MID',
    requiredSkills: [] as string[],
    softSkills: [] as string[],
  })
  const [skillInput, setSkillInput] = useState('')
  const [softSkillInput, setSoftSkillInput] = useState('')

  useEffect(() => {
    if (id) {
      loadJob()
    }
  }, [id])

  const loadJob = async () => {
    try {
      const response = await jobApi.getJobById(parseInt(id!))
      setFormData({
        title: response.data.title,
        description: response.data.description,
        seniorityLevel: response.data.seniorityLevel,
        requiredSkills: response.data.requiredSkills || [],
        softSkills: response.data.softSkills || [],
      })
    } catch (err: any) {
      setError('Failed to load job')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (id) {
        await jobApi.updateJob(parseInt(id), formData)
      } else {
        await jobApi.createJob(formData)
      }
      navigate('/recruiter/jobs')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save job')
    } finally {
      setLoading(false)
    }
  }

  const addRequiredSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()],
      })
      setSkillInput('')
    }
  }

  const removeRequiredSkill = (index: number) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((_, i) => i !== index),
    })
  }

  const addSoftSkill = () => {
    if (softSkillInput.trim()) {
      setFormData({
        ...formData,
        softSkills: [...formData.softSkills, softSkillInput.trim()],
      })
      setSoftSkillInput('')
    }
  }

  const removeSoftSkill = (index: number) => {
    setFormData({
      ...formData,
      softSkills: formData.softSkills.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="job-form-container">
      <div className="job-form-header">
        <h1>{id ? 'Edit Job' : 'Create New Job'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label>Job Title *</label>
          <input
            type="text"
            className="input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="input"
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Seniority Level *</label>
          <select
            className="input"
            value={formData.seniorityLevel}
            onChange={(e) => setFormData({ ...formData, seniorityLevel: e.target.value })}
            required
          >
            <option value="JUNIOR">Junior</option>
            <option value="MID">Mid</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
          </select>
        </div>

        <div className="form-group">
          <label>Required Skills</label>
          <div className="skill-input-group">
            <input
              type="text"
              className="input"
              placeholder="Add a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addRequiredSkill()
                }
              }}
            />
            <button type="button" className="btn btn-primary" onClick={addRequiredSkill}>
              Add
            </button>
          </div>
          <div className="skills-list">
            {formData.requiredSkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button
                  type="button"
                  className="skill-remove"
                  onClick={() => removeRequiredSkill(index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Soft Skills</label>
          <div className="skill-input-group">
            <input
              type="text"
              className="input"
              placeholder="Add a soft skill..."
              value={softSkillInput}
              onChange={(e) => setSoftSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSoftSkill()
                }
              }}
            />
            <button type="button" className="btn btn-primary" onClick={addSoftSkill}>
              Add
            </button>
          </div>
          <div className="skills-list">
            {formData.softSkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button
                  type="button"
                  className="skill-remove"
                  onClick={() => removeSoftSkill(index)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Job' : 'Create Job'}
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

export default JobForm

