import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qRes = await api.get('/quizzes');
        const quizzesData = qRes.data.data || [];
        setQuizzes(quizzesData);

        const subData = {};
        const rankData = {};
        
        await Promise.all(quizzesData.map(async (q) => {
          try {
            const res = await api.get(`/submissions/my/${q.id}`);
            if (res.data.data) {
              subData[q.id] = res.data.data;
              try {
                const rRes = await api.get(`/rankings/${q.id}/mine`);
                if (rRes.data.data) {
                  rankData[q.id] = rRes.data.data;
                }
              } catch (e) {
                // Ignore ranking fetch error
              }
            }
          } catch (e) {
            // Ignore 404 (not submitted)
          }
        }));
        
        setSubmissions(subData);
        setRankings(rankData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="mt-4"><Spinner /></div>;

  return (
    <div>
      <h2 className="mb-4">Student Dashboard</h2>
      <ErrorMessage message={error} />
      
      <div className="d-flex flex-col gap-3 mb-4">
        {quizzes.map(q => {
          const isSubmitted = !!submissions[q.id];
          return (
            <div key={q.id} className="card d-flex justify-between align-center">
              <div>
                <h3 className="mb-2">{q.title}</h3>
                <p className="text-muted mb-2">
                  {q.description?.length > 100 ? q.description.slice(0, 100) + '...' : q.description}
                </p>
                <div className="d-flex gap-3 text-muted" style={{ fontSize: '0.9em' }}>
                  <span>{q.questionCount} Questions</span>
                  <span>By: {q.createdBy?.name || 'Teacher'}</span>
                </div>
              </div>
              <div>
                {isSubmitted ? (
                  <Link to={`/student/result/${submissions[q.id].id}`} className="btn-secondary" style={{ display: 'inline-block' }}>Already submitted</Link>
                ) : (
                  <Link to={`/student/quiz/${q.id}`} className="btn-primary" style={{ display: 'inline-block' }}>Take Quiz</Link>
                )}
              </div>
            </div>
          );
        })}
        {quizzes.length === 0 && <p className="text-muted">No quizzes available at the moment.</p>}
      </div>

      <h3 className="mb-3 mt-4">Your Rankings</h3>
      <div className="d-flex flex-col gap-3">
        {Object.values(rankings).map(r => (
          <div key={r.id} className="card d-flex justify-between align-center">
            <div>
              <div className="font-bold">{quizzes.find(q => q.id === r.quizId)?.title || 'Quiz'}</div>
              <div className="text-muted" style={{ fontSize: '0.9em' }}>Score: {r.score}% | Time: {Math.floor(r.timeTakenSecs / 60)}:{(r.timeTakenSecs % 60).toString().padStart(2, '0')}</div>
            </div>
            <span className="badge badge-success" style={{ fontSize: '1.1em', padding: '6px 12px' }}>Rank: #{r.rank}</span>
          </div>
        ))}
        {Object.keys(rankings).length === 0 && <p className="text-muted">You haven't ranked in any quizzes yet.</p>}
      </div>
    </div>
  );
};

export default StudentDashboard;
