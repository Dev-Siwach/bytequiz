const { z } = require('zod');

const submitSchema = z.object({
  timeTakenSecs: z.number().int().min(1),
  answers: z.array(z.object({
    questionId:   z.string().cuid(),
    chosenOption: z.enum(['A', 'B', 'C', 'D']),
  })).min(1),
});

module.exports = { submitSchema };