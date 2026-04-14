import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeTakenSecs, setTimeTakenSecs] = useState(0);

  useEffect(() => {
    let timer;
    if (quiz && !submitting) {
      timer = setInterval(() => setTimeTakenSecs(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [quiz, submitting]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (quiz && !submitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quiz, submitting]);

  useEffect(() => {
    const initQuiz = async () => {
      try {
        try {
          const subRes = await api.get(`/submissions/my/${id}`);
          if (subRes.data.data) {
            navigate(`/student/result/${subRes.data.data.id}`, { replace: true });
            return;
          }
        } catch (e) {}

        const qRes = await api.get(`/quizzes/${id}`);
        setQuiz(qRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    initQuiz();
  }, [id, navigate]);

  const handleOptionSelect = (option) => {
    const currentQ = quiz.questions[currentQIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: option }));
  };

  const handleNext = () => {
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm("Are you sure you want to submit? You cannot retake this quiz.")) return;
    
    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, chosenOption]) => ({
        questionId,
        chosenOption
      }));

      const res = await api.post(`/submissions/${id}`, {
        timeTakenSecs,
        answers: answersArray
      });

      navigate(`/student/result/${res.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="mt-4"><Spinner /></div>;
  if (error) return <div className="mt-4"><ErrorMessage message={error} /></div>;
  if (!quiz || !quiz.questions || quiz.questions.length === 0) return <div className="mt-4">Quiz has no questions.</div>;

  const currentQ = quiz.questions[currentQIndex];
  const hasSelected = !!answers[currentQ.id];

  return (
    <div className="card mx-auto mt-4" style={{ maxWidth: '700px' }}>
      <div className="d-flex justify-between align-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1.2em', margin: 0 }}>{quiz.title}</h2>
        <div className="font-bold text-primary">
          {Math.floor(timeTakenSecs / 60)}:{(timeTakenSecs % 60).toString().padStart(2, '0')}
        </div>
      </div>
      
      <div className="mb-4 text-muted font-bold">
        Question {currentQIndex + 1} of {quiz.questions.length}
      </div>

      <div className="mb-4" style={{ fontSize: '1.1em' }}>
        {currentQ.text}
      </div>

      <div className="d-flex flex-col gap-3 mb-4">
        {['A', 'B', 'C', 'D'].map(opt => {
          const isSelected = answers[currentQ.id] === opt;
          return (
            <button
              key={opt}
              onClick={() => handleOptionSelect(opt)}
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: isSelected ? 'var(--color-bg)' : 'var(--color-surface)',
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition)',
                fontWeight: isSelected ? 'bold' : 'normal'
              }}
            >
              <span style={{ display: 'inline-block', width: '30px' }}>{opt})</span> {currentQ[`option${opt}`]}
            </button>
          );
        })}
      </div>

      <div className="d-flex justify-between align-center mt-4">
        <div></div>
        {hasSelected && (
          <button className="btn-primary" onClick={handleNext} disabled={submitting}>
            {submitting ? <Spinner /> : (currentQIndex === quiz.questions.length - 1 ? 'Submit' : 'Next')}
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
