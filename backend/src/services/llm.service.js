const callLLM = async (prompt, format = null) => {
  const bodyData = {
    model: process.env.LLM_MODEL || 'batiai/gemma4-e2b:q4',
    prompt,
    stream: false,
  };
  
  if (format) {
    bodyData.format = format;
  }

  const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    throw new Error('LLM service unavailable. Make sure Ollama is running.');
  }

  const data = await response.json();
  return data.response; // plain text string
};

module.exports = { callLLM };
