import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';

const QuizForm = ({ isEdit }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{
    text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: ''
  }]);
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(3);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchQuiz = async () => {
        try {
          const res = await api.get(`/quizzes/${id}/full`);
          const q = res.data.data;
          setTitle(q.title);
          setDescription(q.description || '');
          if (q.questions && q.questions.length > 0) {
            setQuestions(q.questions);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load quiz');
        } finally {
          setLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [isEdit, id]);

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: ''
    }]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) return;
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
  };

  const handleMoveQuestion = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newQ = [...questions];
      [newQ[index - 1], newQ[index]] = [newQ[index], newQ[index - 1]];
      setQuestions(newQ);
    } else if (direction === 'down' && index < questions.length - 1) {
      const newQ = [...questions];
      [newQ[index], newQ[index + 1]] = [newQ[index + 1], newQ[index]];
      setQuestions(newQ);
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  const handleGenerateAI = async () => {
    if (!aiTopic || aiCount < 1 || aiCount > 10) {
      alert("Please provide a topic and a count between 1 and 10.");
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await api.post('/llm/generate', { topic: aiTopic, count: Number(aiCount) });
      const generated = Array.isArray(res.data.data) ? res.data.data : res.data;
      if (Array.isArray(generated)) {
        // Only take the valid questions. Format them correctly.
        const cleaned = generated.map(g => ({
          text: g.text || '',
          optionA: g.optionA || '',
          optionB: g.optionB || '',
          optionC: g.optionC || '',
          optionD: g.optionD || '',
          correctOption: g.correctOption || 'A',
          explanation: g.explanation || ''
        }));
        
        // If we only have 1 empty question, replace it. Otherwise append.
        if (questions.length === 1 && !questions[0].text && !questions[0].optionA) {
          setQuestions(cleaned);
        } else {
          setQuestions([...questions, ...cleaned]);
        }
        setAiPanelOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setGeneratingAi(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) return "Title is required";
    if (questions.length === 0) return "At least one question is required";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return `Question ${i + 1} text is empty`;
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        return `Question ${i + 1} is missing options`;
      }
      if (!q.correctOption) return `Question ${i + 1} has no correct option selected`;
    }
    return null;
  };

  const handleSave = async (publishStatus) => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        isPublished: publishStatus,
        questions: questions.map((q, idx) => ({ ...q, order: idx }))
      };

      if (isEdit) {
        await api.put(`/quizzes/${id}`, payload);
      } else {
        await api.post('/quizzes', payload);
      }
      navigate('/teacher/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz');
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mt-4"><Spinner /></div>;

  return (
    <div className="mx-auto" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-between align-center mb-4">
        <h2>{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h2>
      </div>
      <ErrorMessage message={error} />
      
      <div className="card mb-4">
        <h3 className="mb-3">Section 1 — Quiz Info</h3>
        <div className="mb-3">
          <label className="font-bold d-block mb-2">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Basic Computer Science" />
        </div>
        <div>
          <label className="font-bold d-block mb-2">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details about the quiz" />
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-between align-center mb-3">
          <h3 className="mb-0">Section 2 — Questions</h3>
          <button className="btn-secondary" onClick={() => setAiPanelOpen(!aiPanelOpen)}>
            {aiPanelOpen ? 'Close AI Generator' : 'Generate with AI'}
          </button>
        </div>

        {aiPanelOpen && (
          <div className="card mb-4" style={{ background: '#f0f4ff', borderColor: 'var(--color-primary)' }}>
            <h4 className="mb-3 text-primary">Generate Questions with AI</h4>
            <div className="d-flex gap-3 align-center">
              <div style={{ flex: 1 }}>
                <label className="d-block mb-1 font-bold text-sm">Topic or subject</label>
                <input type="text" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g. World History, React Hooks" />
              </div>
              <div style={{ width: '200px' }}>
                <label className="d-block mb-1 font-bold text-sm">How many (1-10)</label>
                <input type="number" min="1" max="10" value={aiCount} onChange={e => setAiCount(e.target.value)} />
              </div>
              <div style={{ marginTop: '28px' }}>
                <button className="btn-primary" onClick={handleGenerateAI} disabled={generatingAi}>
                  {generatingAi ? <Spinner /> : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="d-flex flex-col gap-4">
          {questions.map((q, idx) => (
            <div key={idx} className="card">
              <div className="d-flex justify-between align-center mb-3 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="font-bold">Question {idx + 1}</div>
                <div className="d-flex gap-2">
                  <button className="btn-secondary" onClick={() => handleMoveQuestion(idx, 'up')} disabled={idx === 0}>↑</button>
                  <button className="btn-secondary" onClick={() => handleMoveQuestion(idx, 'down')} disabled={idx === questions.length - 1}>↓</button>
                  <button className="btn-danger" onClick={() => handleRemoveQuestion(idx)} disabled={questions.length <= 1}>Remove</button>
                </div>
              </div>

              <div className="mb-3">
                <textarea 
                  value={q.text} 
                  onChange={e => updateQuestion(idx, 'text', e.target.value)} 
                  placeholder="Question text" 
                  style={{ minHeight: '60px' }}
                />
              </div>

              <div className="d-flex flex-col gap-2 mb-3">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} className="d-flex gap-2 align-center">
                    <input 
                      type="radio" 
                      name={`correct-${idx}`} 
                      checked={q.correctOption === opt} 
                      onChange={() => updateQuestion(idx, 'correctOption', opt)}
                      style={{ width: 'auto', height: 'auto', margin: 0, cursor: 'pointer' }}
                    />
                    <span className="font-bold" style={{ width: '20px' }}>{opt})</span>
                    <input 
                      type="text" 
                      value={q[`option${opt}`]} 
                      onChange={e => updateQuestion(idx, `option${opt}`, e.target.value)} 
                      placeholder={`Option ${opt}`} 
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-bold text-muted d-block mb-1">Explanation (optional)</label>
                <textarea 
                  value={q.explanation} 
                  onChange={e => updateQuestion(idx, 'explanation', e.target.value)} 
                  placeholder="Why is the correct answer correct?" 
                  style={{ minHeight: '50px' }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button className="btn-secondary" onClick={handleAddQuestion}>+ Add question manually</button>
        </div>
      </div>

      <div className="card mt-4 d-flex justify-between align-center" style={{ background: 'var(--color-bg)' }}>
        <h3 className="mb-0">Section 3 — Submit</h3>
        <div className="d-flex gap-3">
          <button className="btn-secondary" onClick={() => handleSave(false)} disabled={saving}>
            Save as draft
          </button>
          <button className="btn-primary" onClick={() => handleSave(true)} disabled={saving}>
            Save and publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
