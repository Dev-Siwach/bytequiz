const { z } = require('zod');

const questionSchema = z.object({
  text:          z.string().min(5),
  optionA:       z.string().min(1),
  optionB:       z.string().min(1),
  optionC:       z.string().min(1),
  optionD:       z.string().min(1),
  correctOption: z.enum(['A', 'B', 'C', 'D']),
  explanation:   z.string().optional().default(''),
  order:         z.number().int().min(0).optional().default(0),
});

const createQuizSchema = z.object({
  title:       z.string().min(3).max(200),
  description: z.string().max(1000).optional().default(''),
  isPublished: z.boolean().optional().default(false),
  questions:   z.array(questionSchema).min(1),
});

const updateQuizSchema = createQuizSchema.partial();

module.exports = { createQuizSchema, updateQuizSchema };