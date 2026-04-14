import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create User form state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('STUDENT');
  const [creating, setCreating] = useState(false);

  // Reset password state
  const [resetId, setResetId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user) => {
    try {
      const endpoint = user.isActive ? 'deactivate' : 'activate';
      await api.patch(`/admin/users/${user.id}/${endpoint}`);
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleResetPassword = async (id) => {
    if (!resetPassword || resetPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setResetting(true);
    try {
      await api.patch(`/admin/users/${id}/reset-password`, { newPassword: resetPassword });
      alert("Password reset successfully.");
      setResetId(null);
      setResetPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/users', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole
      });
      setShowCreate(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('STUDENT');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="mt-4"><Spinner /></div>;

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <h2>Manage Users</h2>
        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : 'Create User'}
        </button>
      </div>
      
      <ErrorMessage message={error} />

      {showCreate && (
        <div className="card mb-4" style={{ borderTop: '4px solid var(--color-primary)' }}>
          <h3 className="mb-3">Create New User</h3>
          <form onSubmit={handleCreateUser} className="d-flex gap-3 align-center" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" required disabled={creating} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" required disabled={creating} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password (min 6)" required disabled={creating} minLength={6} />
            </div>
            <div style={{ flex: '0 1 150px' }}>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} disabled={creating}>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? <Spinner /> : 'Save User'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg)' }}>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Role</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Created Date</th>
              <th style={{ padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px' }}>{user.name}</td>
                <td style={{ padding: '12px 16px' }}>{user.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge">{user.role}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-warning'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div className="d-flex gap-2 align-center">
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.9em' }}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    {resetId === user.id ? (
                      <div className="d-flex gap-1">
                        <input 
                          type="password" 
                          value={resetPassword} 
                          onChange={e => setResetPassword(e.target.value)} 
                          placeholder="New password" 
                          style={{ width: '120px', height: '30px', padding: '0 8px' }}
                        />
                        <button 
                          className="btn-primary" 
                          style={{ padding: '4px 8px', fontSize: '0.9em' }}
                          onClick={() => handleResetPassword(user.id)}
                          disabled={resetting}
                        >
                          Save
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.9em' }}
                          onClick={() => { setResetId(null); setResetPassword(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.9em' }}
                        onClick={() => setResetId(user.id)}
                      >
                        Reset Password
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
