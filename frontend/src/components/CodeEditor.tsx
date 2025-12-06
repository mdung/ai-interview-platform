import { useState, useEffect, useRef } from 'react'
import './CodeEditor.css'

interface CodeEditorProps {
  language?: string
  initialCode?: string
  onChange?: (code: string) => void
  onRun?: (code: string, language: string) => void
  readOnly?: boolean
  theme?: 'light' | 'dark'
  showLineNumbers?: boolean
  height?: string
}

const CodeEditor = ({
  language = 'javascript',
  initialCode = '',
  onChange,
  onRun,
  readOnly = false,
  theme = 'dark',
  showLineNumbers = true,
  height = '400px'
}: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      const syncScroll = () => {
        if (lineNumbersRef.current) {
          lineNumbersRef.current.scrollTop = textareaRef.current!.scrollTop
        }
      }
      textareaRef.current.addEventListener('scroll', syncScroll)
      return () => {
        textareaRef.current?.removeEventListener('scroll', syncScroll)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setCode(newCode)
    updateCursorPosition(e.target)
    onChange?.(newCode)
  }

  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const text = textarea.value
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = text.substring(0, cursorPos)
    const lines = textBeforeCursor.split('\n')
    setCursorPosition({
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newCode = code.substring(0, start) + '  ' + code.substring(end)
      setCode(newCode)
      onChange?.(newCode)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const handleRun = () => {
    onRun?.(code, language)
  }

  const lineCount = code.split('\n').length
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1)

  return (
    <div className={`code-editor code-editor-${theme}`} style={{ height }}>
      <div className="code-editor-header">
        <div className="code-editor-language">
          <span>{language.toUpperCase()}</span>
        </div>
        <div className="code-editor-cursor-info">
          Line {cursorPosition.line}, Col {cursorPosition.column}
        </div>
        {onRun && (
          <button onClick={handleRun} className="btn btn-primary btn-small">
            Run Code
          </button>
        )}
      </div>
      <div className="code-editor-body">
        {showLineNumbers && (
          <div ref={lineNumbersRef} className="code-editor-line-numbers">
            {lines.map((line) => (
              <div key={line} className="line-number">
                {line}
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={(e) => updateCursorPosition(e.currentTarget)}
          readOnly={readOnly}
          className="code-editor-textarea"
          spellCheck={false}
          placeholder="Write your code here..."
        />
      </div>
      <div className="code-editor-footer">
        <div className="code-editor-stats">
          <span>{lineCount} lines</span>
          <span>{code.length} characters</span>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor

