import { ReactNode } from 'react'
import Navigation from './Navigation'
import './PageLayout.css'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  actions?: ReactNode
}

const PageLayout = ({ children, title, actions }: PageLayoutProps) => {
  return (
    <div className="page-layout">
      <Navigation />
      {title && (
        <div className="page-header-section">
          <h1 className="page-main-title">{title}</h1>
          {actions && <div className="page-header-actions">{actions}</div>}
        </div>
      )}
      <div className="page-content-wrapper">
        {children}
      </div>
    </div>
  )
}

export default PageLayout
