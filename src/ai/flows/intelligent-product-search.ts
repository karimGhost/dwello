'use server';
/**
 * @fileOverview An AI agent that processes natural language product queries to find relevant product IDs.
 *
 * - intelligentProductSearch - A function that handles natural language product search.
 * - IntelligentProductSearchInput - The input type for the intelligentProductSearch function.
 * - IntelligentProductSearchOutput - The return type for the intelligentProductSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntelligentProductSearchInputSchema = z.object({
  query: z.string().describe("A natural language query describing the desired product, e.g., 'a comfortable, modern sofa for a small apartment' or 'energy-efficient refrigerator with smart features'."),
});
export type IntelligentProductSearchInput = z.infer<typeof IntelligentProductSearchInputSchema>;

const IntelligentProductSearchOutputSchema = z.object({
  productIds: z.array(z.string()).describe("A list of relevant product IDs based on the query."),
  rationale: z.string().describe("A brief explanation of why these product IDs are relevant to the user's query."),
});
export type IntelligentProductSearchOutput = z.infer<typeof IntelligentProductSearchOutputSchema>;

// Mock data for products to simulate a product catalog search
const mockProducts = [
  { id: 'sofa-modern-001', type: 'sofa', style: 'modern', keywords: ['comfortable', 'small apartment'], features: [], targetRoom: 'living room', price: 800 },
  { id: 'sofa-classic-001', type: 'sofa', style: 'classic', keywords: ['elegant', 'large'], features: [], targetRoom: 'living room', price: 1200 },
  { id: 'refrigerator-smart-001', type: 'refrigerator', features: ['energy-efficient', 'smart features', 'french door'], keywords: ['large capacity'], targetRoom: 'kitchen', price: 2500 },
  { id: 'refrigerator-basic-001', type: 'refrigerator', features: ['basic', 'affordable'], keywords: ['small'], targetRoom: 'kitchen', price: 600 },
  { id: 'chair-ergonomic-001', type: 'chair', style: 'modern', keywords: ['comfortable', 'office'], features: ['ergonomic', 'adjustable'], targetRoom: 'office', price: 350 },
  { id: 'dining-table-wood-001', type: 'dining table', style: 'rustic', keywords: ['wooden', 'family'], features: ['extendable'], targetRoom: 'dining room', price: 1000 },
  { id: 'bed-frame-minimalist-001', type: 'bed frame', style: 'minimalist', keywords: ['sleek', 'simple'], features: ['platform'], targetRoom: 'bedroom', price: 700 },
  { id: 'lamp-floor-led-001', type: 'lamp', style: 'modern', keywords: ['floor', 'reading'], features: ['LED', 'dimmable'], targetRoom: 'living room', price: 150 },
];

const SearchProductsToolInputSchema = z.object({
  productType: z.string().optional().describe("The type of product to search for (e.g., 'sofa', 'refrigerator', 'chair')."),
  keywords: z.array(z.string()).optional().describe("Keywords extracted from the user's query that describe the product."),
  style: z.string().optional().describe("The style of the product (e.g., 'modern', 'classic', 'minimalist')."),
  features: z.array(z.string()).optional().describe("Specific features the product should have (e.g., 'energy-efficient', 'smart features', 'reclining')."),
  targetRoom: z.string().optional().describe("The room the product is intended for (e.g., 'living room', 'kitchen', 'bedroom')."),
});

const searchProductsTool = ai.defineTool(
  {
    name: 'searchProductsTool',
    description: 'Searches the product catalog for products matching the given attributes.',
    inputSchema: SearchProductsToolInputSchema,
    outputSchema: z.array(z.string()).describe('A list of product IDs that match the search criteria.'),
  },
  async (input) => {
    let results = mockProducts;

    if (input.productType) {
      results = results.filter(p => p.type.toLowerCase().includes(input.productType!.toLowerCase()));
    }
    if (input.style) {
      results = results.filter(p => p.style && p.style.toLowerCase().includes(input.style!.toLowerCase()));
    }
    if (input.keywords && input.keywords.length > 0) {
      const lowerKeywords = input.keywords.map(k => k.toLowerCase());
      results = results.filter(p => p.keywords && lowerKeywords.every(k => p.keywords!.some(pk => pk.includes(k))));
    }
    if (input.features && input.features.length > 0) {
      const lowerFeatures = input.features.map(f => f.toLowerCase());
      results = results.filter(p => p.features && lowerFeatures.every(f => p.features!.some(pf => pf.includes(f))));
    }
    if (input.targetRoom) {
      results = results.filter(p => p.targetRoom && p.targetRoom.toLowerCase().includes(input.targetRoom!.toLowerCase()));
    }

    // Return up to 3 relevant product IDs as a simulation
    return results.slice(0, 3).map(p => p.id);
  }
);

const intelligentProductSearchPrompt = ai.definePrompt({
  name: 'intelligentProductSearchPrompt',
  tools: [searchProductsTool],
  input: { schema: IntelligentProductSearchInputSchema },
  output: { schema: IntelligentProductSearchOutputSchema },
  prompt: `You are an intelligent product search assistant for an e-commerce website named Dwello.
Your goal is to understand a customer's natural language query for a product and find the most relevant product IDs from the catalog using the available tools.

When the user describes a product they are looking for, you must use the 'searchProductsTool' to find relevant product IDs. Analyze the user's query thoroughly to extract the product type, style, keywords, specific features, and the target room for the product. These attributes are crucial for accurately calling the tool.

After successfully calling the 'searchProductsTool', you must respond in JSON format, providing the list of 'productIds' returned by the tool and a concise 'rationale' explaining why these products were selected based on the user's original query and the results from the tool.

User's query: {{{query}}}`,
});

const intelligentProductSearchFlow = ai.defineFlow(
  {
    name: 'intelligentProductSearchFlow',
    inputSchema: IntelligentProductSearchInputSchema,
    outputSchema: IntelligentProductSearchOutputSchema,
  },
  async (input) => {
    const { output } = await intelligentProductSearchPrompt(input);
    return output!;
  }
);

export async function intelligentProductSearch(input: IntelligentProductSearchInput): Promise<IntelligentProductSearchOutput> {
  return intelligentProductSearchFlow(input);
}
