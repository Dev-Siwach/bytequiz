const callLLM = async (prompt) => {
  const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'gemma4:e4b',
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error('LLM service unavailable. Make sure Ollama is running.');
  }

  const data = await response.json();
  return data.response; // plain text string
};

module.exports = { callLLM };