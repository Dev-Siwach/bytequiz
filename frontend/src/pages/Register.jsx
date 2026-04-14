import React, { useState, useContext } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Spinner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
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
      await api.post('/auth/register', { name, email, password, role });
      // Redirect to login after successful registration
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card d-flex flex-col gap-4 mx-auto mt-4" style={{ maxWidth: '400px' }}>
      <h2 className="text-center">Create an Account</h2>
      <ErrorMessage message={error} />
      <form onSubmit={handleSubmit} className="d-flex flex-col gap-3">
        <div>
          <label className="font-bold mb-2 d-block">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} minLength={2} maxLength={100} />
        </div>
        <div>
          <label className="font-bold mb-2 d-block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
        </div>
        <div>
          <label className="font-bold mb-2 d-block">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} minLength={6} maxLength={100} />
        </div>
        <div>
          <label className="font-bold mb-2 d-block">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
          </select>
        </div>
        <button type="submit" className="btn-primary mt-2" disabled={loading}>
          {loading ? <Spinner /> : 'Register'}
        </button>
      </form>
      <p className="text-center mt-3 text-muted">
        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;
