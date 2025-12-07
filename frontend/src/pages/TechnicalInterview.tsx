import { useState } from 'react'
import { useParams } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import Whiteboard from '../components/Whiteboard'
import { useToast } from '../components'
import './TechnicalInterview.css'

const TechnicalInterview = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'code' | 'whiteboard'>('code')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')

  const handleCodeRun = (code: string, language: string) => {
    showToast(`Running ${language} code...`, 'info')
    // TODO: Execute code on backend
    console.log('Code to run:', code)
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
  ]

  return (
    <div className="technical-interview-container">
      <div className="technical-interview-header">
        <h1>Technical Interview</h1>
        <p>Solve coding problems and explain your approach</p>
      </div>

      <div className="question-section">
        <h2>Problem Statement</h2>
        <p>
          Implement a function that takes an array of integers and returns the two numbers that sum to a target value.
          If no such pair exists, return null.
        </p>
        <div className="example">
          <strong>Example:</strong>
          <pre>
            Input: [2, 7, 11, 15], target = 9{'\n'}
            Output: [2, 7]
          </pre>
        </div>
      </div>

      <div className="tools-section">
        <div className="tool-tabs">
          <button
            className={`tab ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            Code Editor
          </button>
          <button
            className={`tab ${activeTab === 'whiteboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('whiteboard')}
          >
            Whiteboard
          </button>
        </div>

        {activeTab === 'code' && (
          <div className="code-section">
            <div className="language-selector">
              <label>Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <CodeEditor
              language={language}
              code={code}
              onChange={handleCodeChange}
              onRun={handleCodeRun}
              theme="dark"
              height="500px"
            />
          </div>
        )}

        {activeTab === 'whiteboard' && (
          <div className="whiteboard-section">
            <Whiteboard width={800} height={600} />
          </div>
        )}
      </div>

      <div className="actions-section">
        <button
          onClick={() => {
            showToast('Answer submitted successfully', 'success')
          }}
          className="btn btn-primary"
        >
          Submit Answer
        </button>
        <button
          onClick={() => {
            setCode('')
            showToast('Code cleared', 'info')
          }}
          className="btn btn-secondary"
        >
          Clear Code
        </button>
      </div>
    </div>
  )
}

export default TechnicalInterview



