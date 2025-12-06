import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import { BulkActions, Modal, useToast, LoadingSpinner, ErrorDisplay } from '../components'
import './AdminUsers.css'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  active: boolean
  createdAt: string
  updatedAt: string
}

const AdminUsers = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await adminApi.getAllUsers()
      setUsers(response.data)
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/')
      } else {
        setError('Failed to load users')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      await adminApi.updateUser(selectedUser.id, editData)
      setShowEditModal(false)
      showToast('User updated successfully', 'success')
      loadUsers()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update user'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    }
  }

  const handleActivate = async (id: number) => {
    try {
      await adminApi.activateUser(id)
      showToast('User activated successfully', 'success')
      loadUsers()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to activate user'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    }
  }

  const handleDeactivate = async (id: number) => {
    try {
      await adminApi.deactivateUser(id)
      showToast('User deactivated successfully', 'success')
      loadUsers()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to deactivate user'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      await adminApi.deleteUser(id)
      showToast('User deleted successfully', 'success')
      loadUsers()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete user'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    }
  }

  const handleBulkActivate = async () => {
    if (selectedUsers.size === 0) return
    
    try {
      await Promise.all(Array.from(selectedUsers).map((id) => adminApi.activateUser(id)))
      showToast(`${selectedUsers.size} user(s) activated`, 'success')
      setSelectedUsers(new Set())
      loadUsers()
    } catch (err: any) {
      showToast('Failed to activate users', 'error')
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedUsers.size === 0) return
    
    try {
      await Promise.all(Array.from(selectedUsers).map((id) => adminApi.deactivateUser(id)))
      showToast(`${selectedUsers.size} user(s) deactivated`, 'success')
      setSelectedUsers(new Set())
      loadUsers()
    } catch (err: any) {
      showToast('Failed to deactivate users', 'error')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return
    
    try {
      await Promise.all(Array.from(selectedUsers).map((id) => adminApi.deleteUser(id)))
      showToast(`${selectedUsers.size} user(s) deleted`, 'success')
      setSelectedUsers(new Set())
      loadUsers()
    } catch (err: any) {
      showToast('Failed to delete users', 'error')
    }
  }

  const toggleUserSelection = (id: number) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedUsers(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)))
    }
  }

  if (loading) {
    return (
      <div className="admin-users-container">
        <LoadingSpinner message="Loading users..." />
      </div>
    )
  }

  return (
    <div className="admin-users-container">
      <div className="admin-header">
        <h1>User Management</h1>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {error && <ErrorDisplay error={error} />}

      {selectedUsers.size > 0 && (
        <BulkActions
          selectedCount={selectedUsers.size}
          onBulkActivate={handleBulkActivate}
          onBulkDeactivate={handleBulkDeactivate}
          onBulkDelete={handleBulkDelete}
          availableActions={['activate', 'deactivate', 'delete']}
        />
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                </td>
                <td>{user.id}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    {user.active ? (
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleDeactivate(user.id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleActivate(user.id)}
                      >
                        Activate
                      </button>
                    )}
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="small"
      >
        {selectedUser && (
          <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  className="input"
                  value={editData.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  className="input"
                  value={editData.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="input"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
        )}
      </Modal>
    </div>
  )
}

export default AdminUsers

