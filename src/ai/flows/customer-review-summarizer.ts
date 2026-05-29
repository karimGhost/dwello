'use server';
/**
 * @fileOverview This file implements a Genkit flow for summarizing customer reviews.
 *
 * - summarizeCustomerReviews - A function that handles the summarization process.
 * - SummarizeCustomerReviewsInput - The input type for the summarizeCustomerReviews function.
 * - SummarizeCustomerReviewsOutput - The return type for the summarizeCustomerReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCustomerReviewsInputSchema = z.object({
  reviews: z
    .array(z.string())
    .describe('An array of customer reviews to be summarized.'),
});
export type SummarizeCustomerReviewsInput = z.infer<
  typeof SummarizeCustomerReviewsInputSchema
>;

const SummarizeCustomerReviewsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the product reviews, highlighting common pros, cons, and frequently mentioned features.'
    ),
});
export type SummarizeCustomerReviewsOutput = z.infer<
  typeof SummarizeCustomerReviewsOutputSchema
>;

const summarizeReviewsPrompt = ai.definePrompt({
  name: 'summarizeReviewsPrompt',
  input: {schema: SummarizeCustomerReviewsInputSchema},
  output: {schema: SummarizeCustomerReviewsOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing product reviews.
Your task is to analyze the provided customer reviews for a product and generate a concise summary.
The summary should highlight:
1.  Common Pros: What do customers consistently praise?
2.  Common Cons: What are the frequent complaints or drawbacks?
3.  Frequently Mentioned Features: What specific features are often talked about?

Present the summary in an easy-to-read format.

Customer Reviews:
{{#each reviews}}
- {{{this}}}
{{/each}}`,
});

const summarizeCustomerReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeCustomerReviewsFlow',
    inputSchema: SummarizeCustomerReviewsInputSchema,
    outputSchema: SummarizeCustomerReviewsOutputSchema,
  },
  async input => {
    const {output} = await summarizeReviewsPrompt(input);
    return output!;
  }
);

export async function summarizeCustomerReviews(
  input: SummarizeCustomerReviewsInput
): Promise<SummarizeCustomerReviewsOutput> {
  return summarizeCustomerReviewsFlow(input);
}
