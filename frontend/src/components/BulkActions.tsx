import { useState } from 'react'
import { Modal, useToast } from './'
import './BulkActions.css'

export interface BulkActionsProps {
  selectedCount: number
  onBulkDelete?: () => void
  onBulkExport?: () => void
  onBulkActivate?: () => void
  onBulkDeactivate?: () => void
  onBulkUpdate?: () => void
  availableActions?: ('delete' | 'export' | 'activate' | 'deactivate' | 'update')[]
  className?: string
}

const BulkActions = ({
  selectedCount,
  onBulkDelete,
  onBulkExport,
  onBulkActivate,
  onBulkDeactivate,
  onBulkUpdate,
  availableActions = ['delete', 'export'],
  className = ''
}: BulkActionsProps) => {
  const { showToast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (selectedCount === 0) return null

  const handleBulkDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    onBulkDelete?.()
    setShowDeleteConfirm(false)
    showToast(`${selectedCount} item(s) deleted`, 'success')
  }

  const handleBulkExport = () => {
    onBulkExport?.()
    showToast(`Exporting ${selectedCount} item(s)`, 'info')
  }

  const handleBulkActivate = () => {
    onBulkActivate?.()
    showToast(`${selectedCount} item(s) activated`, 'success')
  }

  const handleBulkDeactivate = () => {
    onBulkDeactivate?.()
    showToast(`${selectedCount} item(s) deactivated`, 'success')
  }

  const handleBulkUpdate = () => {
    onBulkUpdate?.()
    showToast(`Updating ${selectedCount} item(s)`, 'info')
  }

  return (
    <>
      <div className={`bulk-actions ${className}`}>
        <div className="bulk-actions-info">
          <strong>{selectedCount}</strong> item(s) selected
        </div>
        <div className="bulk-actions-buttons">
          {availableActions.includes('export') && onBulkExport && (
            <button
              className="btn btn-small btn-primary"
              onClick={handleBulkExport}
            >
              Export Selected
            </button>
          )}
          {availableActions.includes('activate') && onBulkActivate && (
            <button
              className="btn btn-small btn-success"
              onClick={handleBulkActivate}
            >
              Activate Selected
            </button>
          )}
          {availableActions.includes('deactivate') && onBulkDeactivate && (
            <button
              className="btn btn-small btn-warning"
              onClick={handleBulkDeactivate}
            >
              Deactivate Selected
            </button>
          )}
          {availableActions.includes('update') && onBulkUpdate && (
            <button
              className="btn btn-small btn-primary"
              onClick={handleBulkUpdate}
            >
              Update Selected
            </button>
          )}
          {availableActions.includes('delete') && onBulkDelete && (
            <button
              className="btn btn-small btn-danger"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Bulk Delete"
        size="small"
      >
        <p>Are you sure you want to delete {selectedCount} item(s)? This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={confirmDelete}>
            Delete
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  )
}

export default BulkActions



