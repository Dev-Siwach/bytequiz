import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '16px 24px' }}>
      <div className="d-flex justify-between align-center" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ margin: 0 }}>
          <Link to="/">Quiz Platform</Link>
        </h2>
        <div className="d-flex align-center gap-3">
          <span className="text-muted">
            {user.name} ({user.role})
          </span>
          <button className="btn-secondary" onClick={() => logout()}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
