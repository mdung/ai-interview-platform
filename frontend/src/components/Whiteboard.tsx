import { useState, useRef, useEffect } from 'react'
import './Whiteboard.css'

interface WhiteboardProps {
  width?: number
  height?: number
  lineColor?: string
  lineWidth?: number
  onDraw?: (data: DrawingData) => void
  initialData?: DrawingData
  readOnly?: boolean
}

export interface DrawingData {
  paths: Array<{
    points: Array<{ x: number; y: number }>
    color: string
    width: number
  }>
}

const Whiteboard = ({
  width = 800,
  height = 600,
  lineColor = '#000000',
  lineWidth = 2,
  onDraw,
  initialData,
  readOnly = false
}: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([])
  const [paths, setPaths] = useState<DrawingData['paths']>(initialData?.paths || [])
  const [currentColor, setCurrentColor] = useState(lineColor)
  const [currentWidth, setCurrentWidth] = useState(lineWidth)

  useEffect(() => {
    if (initialData) {
      setPaths(initialData.paths)
      redrawCanvas()
    }
  }, [initialData])

  useEffect(() => {
    redrawCanvas()
  }, [paths])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    paths.forEach((path) => {
      if (path.points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = path.color
      ctx.lineWidth = path.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.moveTo(path.points[0].x, path.points[0].y)
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y)
      }
      ctx.stroke()
    })
  }

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return

    const coords = getCoordinates(e)
    if (!coords) return

    setIsDrawing(true)
    setCurrentPath([coords])
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return

    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const newPath = [...currentPath, coords]
    setCurrentPath(newPath)

    // Draw current path
    if (newPath.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = currentColor
      ctx.lineWidth = currentWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.moveTo(newPath[newPath.length - 2].x, newPath[newPath.length - 2].y)
      ctx.lineTo(newPath[newPath.length - 1].x, newPath[newPath.length - 1].y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (!isDrawing || readOnly) return

    if (currentPath.length > 0) {
      const newPaths = [...paths, { points: currentPath, color: currentColor, width: currentWidth }]
      setPaths(newPaths)
      onDraw?.({ paths: newPaths })
    }

    setIsDrawing(false)
    setCurrentPath([])
  }

  const clear = () => {
    if (readOnly) return

    setPaths([])
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    onDraw?.({ paths: [] })
  }

  const undo = () => {
    if (readOnly) return

    const newPaths = paths.slice(0, -1)
    setPaths(newPaths)
    onDraw?.({ paths: newPaths })
  }

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']

  return (
    <div className="whiteboard-container">
      {!readOnly && (
        <div className="whiteboard-toolbar">
          <div className="color-picker">
            {colors.map((color) => (
              <button
                key={color}
                className={`color-button ${currentColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
                title={color}
              />
            ))}
          </div>
          <div className="width-picker">
            <label>Width:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={currentWidth}
              onChange={(e) => setCurrentWidth(Number(e.target.value))}
            />
            <span>{currentWidth}px</span>
          </div>
          <div className="whiteboard-actions">
            <button onClick={undo} className="btn btn-secondary" disabled={paths.length === 0}>
              Undo
            </button>
            <button onClick={clear} className="btn btn-danger">
              Clear
            </button>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="whiteboard-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  )
}

export default Whiteboard

