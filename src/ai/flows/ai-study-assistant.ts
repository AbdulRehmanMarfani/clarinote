'use server';

/**
 * @fileOverview Implements the AI Study Assistant flow for explaining concepts, summarizing information,
 * and suggesting flashcards based on the responses.
 *
 * - aiStudyAssistant - A function that handles the AI study assistant process.
 * - AIStudyAssistantInput - The input type for the aiStudyAssistant function.
 * - AIStudyAssistantOutput - The return type for the aiStudyAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIStudyAssistantInputSchema = z.object({
  query: z.string().describe('The query or question asked by the student.'),
  simplify: z.boolean().optional().describe('If true, the AI will explain the concept in very simple terms (Explain Like I am 5).'),
});
export type AIStudyAssistantInput = z.infer<typeof AIStudyAssistantInputSchema>;

const AIStudyAssistantOutputSchema = z.object({
  response: z.string().describe('The response from the AI study assistant.'),
  suggestedFlashcards: z
    .array(z.object({question: z.string(), answer: z.string()}))
    .describe('Suggested flashcards based on the AI response.'),
});
export type AIStudyAssistantOutput = z.infer<typeof AIStudyAssistantOutputSchema>;

export async function aiStudyAssistant(input: AIStudyAssistantInput): Promise<AIStudyAssistantOutput> {
  return aiStudyAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStudyAssistantPrompt',
  input: {schema: AIStudyAssistantInputSchema},
  output: {schema: AIStudyAssistantOutputSchema},
  prompt: `You are a helpful AI study assistant. Your goal is to help students learn by explaining concepts, summarizing information, and suggesting flashcards based on the student's query.

  {{#if simplify}}
  A crucial part of your role is to simplify complex topics. The user has requested a very simple explanation. Explain the concept as if you were talking to a very curious 5-year-old. Use simple words and analogies. Do not suggest flashcards in this simplified response.
  {{/if}}

  Query: {{{query}}}

  {{#unless simplify}}
  Format your response as follows:

  Response: [Explanation or Summary]
  Suggested Flashcards:
  - Question: [Question 1]
    Answer: [Answer 1]
  - Question: [Question 2]
    Answer: [Answer 2]
  - Question: [Question 3]
    Answer: [Answer 3]
  {{/unless}}
`,
});

const aiStudyAssistantFlow = ai.defineFlow(
  {
    name: 'aiStudyAssistantFlow',
    inputSchema: AIStudyAssistantInputSchema,
    outputSchema: AIStudyAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
