import React, { useState, useContext } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user) {
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.data.token, response.data.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card d-flex flex-col gap-4 mx-auto mt-4" style={{ maxWidth: '400px' }}>
      <h2 className="text-center">Login to Quiz Platform</h2>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className="d-flex flex-col gap-3">
        <div>
          <label className="font-bold mb-2 d-block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
        </div>
        <div>
          <label className="font-bold mb-2 d-block">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
        </div>
        <button type="submit" className="btn-primary mt-2" disabled={loading}>
          {loading ? <Spinner /> : 'Login'}
        </button>
      </form>
      <p className="text-center mt-3 text-muted">
        Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Register</Link>
      </p>
    </div>
  );
};

export default Login;
