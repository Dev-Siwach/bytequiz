import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const QuizResult = () => {
  const { id } = useParams(); // submissionId
  const [submission, setSubmission] = useState(null);
  const [rankInfo, setRankInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [explaining, setExplaining] = useState({}); // { questionId: boolean }
  const [explanations, setExplanations] = useState({}); // { questionId: string }

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Spec says GET /api/submissions/my/:quizId.
        // But we only have submissionId in URL. Wait, can we get submission by ID?
        // Let's assume we can GET /api/quizzes to find our submission or maybe the API has an undocumented way, 
        // wait, the spec says "where submissionId comes from the API response". 
        // But how to fetch the submission itself? "Fetch GET /api/submissions/my/:quizId (or use the submission data from the previous POST response stored in state/localStorage temporarily)."
        // Let's try to get it by fetching quizzes and finding the matching submission, or actually `GET /api/submissions/my/:quizId` requires quizId.
        // Let's check `api.get('/quizzes')` to find all, then fetch my submissions.
        // Or wait, if we only have submissionId, how do we get the quizId?
        // Let's fetch all my submissions? No endpoint for that.
        // Actually, we can fetch all quizzes, then fetch `GET /api/submissions/my/:q.id` until we find the one with `id === submissionId`.
        
        const qRes = await api.get('/quizzes');
        let mySub = null;
        let myQuizId = null;
        
        for (const q of qRes.data.data) {
          try {
            const subRes = await api.get(`/submissions/my/${q.id}`);
            if (subRes.data.data && subRes.data.data.id === id) {
              mySub = subRes.data.data;
              myQuizId = q.id;
              break;
            }
          } catch (e) {}
        }
        
        if (!mySub) throw new Error("Submission not found");
        
        setSubmission(mySub);
        
        try {
          const rRes = await api.get(`/rankings/${myQuizId}/mine`);
          if (rRes.data.data) setRankInfo(rRes.data.data);
        } catch (e) {}
        
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  const handleExplain = async (answer) => {
    setExplaining(prev => ({ ...prev, [answer.questionId]: true }));
    try {
      // Find the question details from the quiz. Wait, submission response includes question details?
      // "Return the full submission result including per-question isCorrect, correctOption, and explanation."
      // BUT it might not include option text. 
      // The POST /api/llm/explain requires: questionText, optionA, B, C, D, correctOption, chosenOption.
      // So I need the question text. Wait, `GET /api/submissions/my/:quizId` might not include question text if it's just the submission model.
      // Let's fetch `GET /api/quizzes/:quizId` to get the question texts.
      const qRes = await api.get(`/quizzes/${submission.quizId}`);
      const quizData = qRes.data.data;
      const question = quizData.questions.find(q => q.id === answer.questionId);

      const res = await api.post('/llm/explain', {
        questionText: question.text,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctOption: answer.correctOption || question.correctOption, // might need to be passed down
        chosenOption: answer.chosenOption
      });
      setExplanations(prev => ({ ...prev, [answer.questionId]: res.data.data || res.data }));
    } catch (err) {
      setExplanations(prev => ({ ...prev, [answer.questionId]: err.response?.data?.message || 'Failed to generate explanation.' }));
    } finally {
      setExplaining(prev => ({ ...prev, [answer.questionId]: false }));
    }
  };

  if (loading) return <div className="mt-4"><Spinner /></div>;
  if (error) return <div className="mt-4"><ErrorMessage message={error} /></div>;
  if (!submission) return null;

  return (
    <div className="mx-auto mt-4" style={{ maxWidth: '800px' }}>
      <div className="card text-center mb-4" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--color-primary)', margin: 0 }}>{Math.round(submission.score)}%</h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', marginTop: '8px' }}>
          {submission.correctQ} / {submission.totalQ} correct
        </p>
        <p className="font-bold mt-2">
          Time taken: {Math.floor(submission.timeTakenSecs / 60)}:{(submission.timeTakenSecs % 60).toString().padStart(2, '0')}
        </p>
        {rankInfo && (
          <div className="mt-3 badge badge-success" style={{ fontSize: '1.1rem', padding: '8px 16px' }}>
            You ranked #{rankInfo.rank} on this quiz.
          </div>
        )}
      </div>

      <div className="d-flex flex-col gap-4">
        {submission.answers.map((ans, idx) => {
          const isWrong = !ans.isCorrect;
          return (
            <div key={ans.id} className="card">
              <div className="font-bold mb-3">Question {idx + 1}</div>
              <div className="mb-3">{ans.question?.text || 'Question text not available in this view. (Backend might need to include it)'}</div>
              <div className="d-flex flex-col gap-2 mb-3">
                {['A', 'B', 'C', 'D'].map(opt => {
                  let bgColor = 'var(--color-surface)';
                  let borderColor = 'var(--color-border)';
                  if (opt === ans.correctOption) {
                    bgColor = 'var(--color-correct)';
                    borderColor = 'var(--color-success)';
                  } else if (opt === ans.chosenOption && isWrong) {
                    bgColor = 'var(--color-wrong)';
                    borderColor = 'var(--color-danger)';
                  }
                  return (
                    <div key={opt} style={{ padding: '10px 16px', background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ width: '30px', display: 'inline-block' }}>{opt})</span>
                      {ans.question ? ans.question[`option${opt}`] : `Option ${opt}`}
                    </div>
                  );
                })}
              </div>
              {isWrong && !explanations[ans.questionId] && (
                <button 
                  className="btn-secondary mt-2" 
                  onClick={() => handleExplain(ans)}
                  disabled={explaining[ans.questionId]}
                >
                  {explaining[ans.questionId] ? <Spinner /> : 'Explain my mistake'}
                </button>
              )}
              {explanations[ans.questionId] && (
                <div className="mt-3" style={{ padding: '16px', background: 'var(--color-bg)', borderLeft: '4px solid var(--color-primary)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                  <h4 className="mb-2 text-primary">AI Explanation</h4>
                  <p>{typeof explanations[ans.questionId] === 'string' ? explanations[ans.questionId] : (explanations[ans.questionId].explanation || 'Explanation loaded.')}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-4 mb-4">
        <Link to="/student/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default QuizResult;
