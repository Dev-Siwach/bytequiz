import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, quizzes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, quizzesRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/quizzes')
        ]);
        
        const users = usersRes.data.data || [];
        const quizzes = quizzesRes.data.data || [];
        
        setStats({
          students: users.filter(u => u.role === 'STUDENT').length,
          teachers: users.filter(u => u.role === 'TEACHER').length,
          quizzes: quizzes.length
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="mt-4"><Spinner /></div>;

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>
      <ErrorMessage message={error} />
      
      <div className="d-flex gap-4 mb-4">
        <div className="card text-center" style={{ flex: 1 }}>
          <h3 className="text-muted mb-2">Total Students</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.students}</div>
        </div>
        <div className="card text-center" style={{ flex: 1 }}>
          <h3 className="text-muted mb-2">Total Teachers</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.teachers}</div>
        </div>
        <div className="card text-center" style={{ flex: 1 }}>
          <h3 className="text-muted mb-2">Total Quizzes</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.quizzes}</div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="mb-3">Quick Actions</h3>
        <Link to="/admin/users" className="btn-primary d-inline-block">Manage Users</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
