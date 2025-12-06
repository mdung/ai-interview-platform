import './Skeleton.css'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular'
  className?: string
  count?: number
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = ({
  width,
  height,
  variant = 'rectangular',
  className = '',
  count = 1,
  animation = 'pulse'
}: SkeletonProps) => {
  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  }

  const skeletonClass = `skeleton skeleton-${variant} skeleton-${animation} ${className}`

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={skeletonClass} style={style} aria-hidden="true" />
        ))}
      </>
    )
  }

  return <div className={skeletonClass} style={style} aria-hidden="true" />
}

export default Skeleton

