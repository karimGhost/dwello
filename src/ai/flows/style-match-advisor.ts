'use server';
/**
 * @fileOverview A GenAI tool that acts as an interior designer to suggest home appliances and furniture pairings
 *               based on user descriptions of their room layout.
 *
 * - styleMatchAdvisor - A function that handles the AI-powered style matching process.
 * - StyleMatchAdvisorInput - The input type for the styleMatchAdvisor function.
 * - StyleMatchAdvisorOutput - The return type for the styleMatchAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleMatchAdvisorInputSchema = z.object({
  roomDescription: z
    .string()
    .describe("A natural language description of the room's style and dimensions, e.g., 'My living room is small, modern, and I prefer minimalist designs. It has light gray walls and wooden floors.'"),
});
export type StyleMatchAdvisorInput = z.infer<typeof StyleMatchAdvisorInputSchema>;

const RecommendationItemSchema = z.object({
  name: z.string().describe("The name of the recommended item (e.g., 'Scandinavian Sofa', 'Smart Refrigerator')."),
  type: z.string().describe("The general type of the item (e.g., 'sofa', 'coffee table', 'refrigerator', 'oven')."),
  style: z.string().describe("The specific design style of the item (e.g., 'mid-century modern', 'minimalist', 'industrial')."),
  reasoning: z.string().describe("Explanation for why this item is recommended based on the room description."),
});

const StyleMatchAdvisorOutputSchema = z.object({
  overallStyleAnalysis: z
    .string()
    .describe("A summary of the identified room style and characteristics based on the user's description."),
  furnitureRecommendations: z.array(RecommendationItemSchema).describe('A list of recommended furniture items.'),
  applianceRecommendations: z.array(RecommendationItemSchema).describe('A list of recommended home appliance items.'),
  styleTips: z.array(z.string()).describe('Additional tips and suggestions to enhance the room\u0027s style.'),
});
export type StyleMatchAdvisorOutput = z.infer<typeof StyleMatchAdvisorOutputSchema>;

export async function styleMatchAdvisor(input: StyleMatchAdvisorInput): Promise<StyleMatchAdvisorOutput> {
  return styleMatchAdvisorFlow(input);
}

const styleMatchAdvisorPrompt = ai.definePrompt({
  name: 'styleMatchAdvisorPrompt',
  input: {schema: StyleMatchAdvisorInputSchema},
  output: {schema: StyleMatchAdvisorOutputSchema},
  prompt: `You are an expert interior designer and home decor advisor. Your task is to analyze a customer's room description and provide tailored recommendations for furniture and home appliances that perfectly complement their stated style and dimensions.

Carefully read the room description provided by the user.
Identify the key stylistic elements, color palettes, and functional needs based on the description.
Generate a list of furniture recommendations and a separate list of home appliance recommendations.
For each recommendation, include the item's name, its type, its specific design style, and a brief reasoning for its suitability.
Also, provide an overall analysis of the room's style that you've identified, and offer some general style tips.

Ensure your recommendations are practical, stylish, and suitable for the described space.

Room Description: {{{roomDescription}}}

Strictly adhere to the following JSON schema for your output. Do not include any other text or formatting outside of the JSON object.`,
});

const styleMatchAdvisorFlow = ai.defineFlow(
  {
    name: 'styleMatchAdvisorFlow',
    inputSchema: StyleMatchAdvisorInputSchema,
    outputSchema: StyleMatchAdvisorOutputSchema,
  },
  async input => {
    const {output} = await styleMatchAdvisorPrompt(input);
    return output!;
  }
);
