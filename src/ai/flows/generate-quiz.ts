'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a quiz based on a topic and a set of flashcards.
 *
 * The flow accepts a topic name and an array of flashcards and uses an AI model to generate a short,
 * multiple-choice quiz to test the user's knowledge.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The name of the topic or deck.'),
  flashcards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).describe('The list of flashcards to base the quiz on.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

// Define the output schema
const QuizQuestionSchema = z.object({
    questionText: z.string().describe("The text of the multiple-choice question."),
    options: z.array(z.string()).describe("An array of 4 possible answers."),
    correctAnswerIndex: z.number().describe("The 0-based index of the correct answer in the options array."),
    explanation: z.string().describe("A brief explanation for why the correct answer is right.")
});

const GenerateQuizOutputSchema = z.object({
  quizTitle: z.string().describe('A title for the quiz.'),
  questions: z.array(QuizQuestionSchema).describe('An array of 3-5 quiz questions.'),
});

export type Quiz = z.infer<typeof GenerateQuizOutputSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;


// Exported function to generate a quiz
export async function generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an AI that generates quizzes for students. Based on the provided topic and flashcards, create a multiple-choice quiz to test understanding.

  Topic: {{{topic}}}
  
  Flashcards:
  {{#each flashcards}}
  - Question: {{this.question}}
    Answer: {{this.answer}}
  {{/each}}
  
  Generate a quiz with 3-5 multiple-choice questions. Each question must have exactly 4 options. Ensure one option is correct and the others are plausible distractors. Provide a brief explanation for the correct answer.
  `,
});

// Define the Genkit flow
const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
