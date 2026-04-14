import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quizzes/mine');
      setQuizzes(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await api.patch(`/quizzes/${id}/publish`);
      // Update local state
      setQuizzes(quizzes.map(q => q.id === id ? { ...q, isPublished: !q.isPublished } : q));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle publish status');
    }
  };

  if (loading) return <div className="mt-4"><Spinner /></div>;

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <h2>Teacher Dashboard</h2>
        <Link to="/teacher/quiz/create" className="btn-primary">Create New Quiz</Link>
      </div>
      <ErrorMessage message={error} />
      
      <div className="d-flex flex-col gap-3">
        {quizzes.map(q => (
          <div key={q.id} className="card d-flex justify-between align-center">
            <div>
              <h3 className="mb-2 d-flex align-center gap-2">
                {q.title}
                <span className={`badge ${q.isPublished ? 'badge-success' : 'badge-warning'}`}>
                  {q.isPublished ? 'Published' : 'Draft'}
                </span>
              </h3>
              <div className="text-muted" style={{ fontSize: '0.9em' }}>
                <span>{q.questions ? q.questions.length : (q.questionCount || 0)} Questions</span>
                <span className="ml-3"> • Created: {new Date(q.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn-secondary" 
                onClick={() => handleTogglePublish(q.id)}
              >
                {q.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <Link to={`/teacher/quiz/${q.id}/edit`} className="btn-secondary">Edit</Link>
              <button className="btn-danger" onClick={() => handleDelete(q.id)}>Delete</button>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && <p className="text-muted">You haven't created any quizzes yet.</p>}
      </div>
    </div>
  );
};

export default TeacherDashboard;
