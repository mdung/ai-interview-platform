import { useRef, useEffect, useState } from 'react'
import './RichTextEditor.css'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minHeight?: number
  maxHeight?: number
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  className = '',
  disabled = false,
  minHeight = 200,
  maxHeight = 500,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      // Allow Enter to create new line, Ctrl+Enter for submit if needed
    }
  }

  return (
    <div className={`rich-text-editor ${className} ${disabled ? 'disabled' : ''}`}>
      <div className="rich-text-toolbar">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
          disabled={disabled}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
          disabled={disabled}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('underline')}
          title="Underline (Ctrl+U)"
          disabled={disabled}
        >
          <u>U</u>
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
          disabled={disabled}
        >
          ⬅
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
          disabled={disabled}
        >
          ⬌
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
          disabled={disabled}
        >
          ➡
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
          disabled={disabled}
        >
          •
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
          disabled={disabled}
        >
          1.
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => {
            const url = prompt('Enter URL:')
            if (url) execCommand('createLink', url)
          }}
          title="Insert Link"
          disabled={disabled}
        >
          🔗
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => execCommand('removeFormat')}
          title="Remove Formatting"
          disabled={disabled}
        >
          ✂
        </button>
      </div>
      <div
        ref={editorRef}
        className={`rich-text-content ${isFocused ? 'focused' : ''}`}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
        }}
        suppressContentEditableWarning
      />
    </div>
  )
}

export default RichTextEditor


