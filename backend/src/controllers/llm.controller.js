const { callLLM } = require('../services/llm.service');

const explain = async (req, res, next) => {
  try {
    const { questionText, optionA, optionB, optionC, optionD, correctOption, chosenOption } = req.body;

    if (!questionText || !correctOption || !chosenOption) {
      const err = new Error('Missing required fields');
      err.status = 400;
      throw err;
    }

    if (correctOption === chosenOption) {
      const err = new Error('Student answered correctly, no explanation needed.');
      err.status = 400;
      throw err;
    }

    const optionsMap = {
      A: optionA,
      B: optionB,
      C: optionC,
      D: optionD
    };

    const chosenOptionText = optionsMap[chosenOption];
    const correctOptionText = optionsMap[correctOption];

    const prompt = `You are a helpful quiz tutor. A student answered a multiple choice question incorrectly.

Question: ${questionText}

Options:
A) ${optionA}
B) ${optionB}
C) ${optionC}
D) ${optionD}

The student chose: ${chosenOption}) ${chosenOptionText}
The correct answer is: ${correctOption}) ${correctOptionText}

In 3 to 5 sentences, explain why the student's answer was wrong and why the correct answer is right. Be clear, educational, and encouraging. Do not repeat the question back. Just explain the concept.`;

    const response = await callLLM(prompt);
    
    res.status(200).json({ success: true, data: { explanation: response.trim() } });
  } catch (error) {
    next(error);
  }
};

const generate = async (req, res, next) => {
  try {
    const { topic, count } = req.body;

    if (!topic || typeof count !== 'number' || count < 1 || count > 10) {
      const err = new Error('Topic is required and count must be between 1 and 10');
      err.status = 400;
      throw err;
    }

    const prompt = `You are a quiz question generator. Generate exactly ${count} multiple choice questions about the topic: "${topic}".

Return your response as a valid JSON array only. No explanation, no preamble, no markdown fences. Just the raw JSON array.

Each object in the array must have these exact fields:
- "text": the question text (string)
- "optionA": option A text (string)
- "optionB": option B text (string)
- "optionC": option C text (string)
- "optionD": option D text (string)
- "correctOption": one of "A", "B", "C", or "D" (string)
- "explanation": a one-sentence explanation of why the correct answer is right (string)

Example format:
[
  {
    "text": "What is the capital of France?",
    "optionA": "Berlin",
    "optionB": "Madrid",
    "optionC": "Paris",
    "optionD": "Rome",
    "correctOption": "C",
    "explanation": "Paris is the capital and largest city of France."
  }
]`;

    const raw = await callLLM(prompt);
    const cleaned = raw.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    
    let questions;
    try {
      questions = JSON.parse(cleaned);
    } catch (e) {
      const err = new Error('LLM returned malformed JSON. Try again.');
      err.status = 502;
      throw err;
    }

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

module.exports = { explain, generate };