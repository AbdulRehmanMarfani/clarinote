'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating flashcards and a summary from various input types.
 *
 * The flow accepts notes or documents as input and uses an AI model to generate a set of flashcards and a topic summary.
 * Each flashcard consists of a question and an answer.
 *
 * @interface GenerateFlashcardsInput - Defines the input schema for the generateFlashcards function.
 * @interface GenerateFlashcardsOutput - Defines the output schema for the generateFlashcards function.
 * @function generateFlashcards - The main function that triggers the flashcard generation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const GenerateFlashcardsInputSchema = z.object({
  inputType: z.enum(['text', 'pdf']).describe('The type of input provided.'),
  inputText: z.string().optional().describe('The input text content when inputType is "text".'),
  pdfDataUri: z.string().optional().describe("The PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Required when inputType is \"pdf\"."),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

// Define the output schema
const GenerateFlashcardsOutputSchema = z.object({
  summary: z.string().describe('A concise, one-paragraph summary of the key points from the input.'),
  flashcards: z.array(
    z.object({
      question: z.string().describe('The flashcard question.'),
      answer: z.string().describe('The flashcard answer.'),
    })
  ).describe('An array of generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;


// Exported function to generate flashcards
export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are a flashcard and summary generator AI.

  Based on the input provided, generate a concise, one-paragraph summary of the key points, and then a set of flashcards with questions and answers.

  The input type is: {{{inputType}}}

  {{#if inputText}}
  Here is the input text:
  {{inputText}}
  {{/if}}

  {{#if pdfDataUri}}
  Here is the PDF content: {{media url=pdfDataUri}}
  {{/if}}

  Generate 3-5 flashcards based on the input. The flashcards should be helpful for studying the material.
  `,
});

// Define the Genkit flow
const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
