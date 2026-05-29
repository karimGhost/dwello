'use server';
/**
 * @fileOverview A Genkit flow that generates comprehensive and engaging product descriptions
 * based on basic product details provided by a seller.
 *
 * - generateProductDescription - A function that generates a product description.
 * - ProductDescriptionGeneratorInput - The input type for the generateProductDescription function.
 * - ProductDescriptionGeneratorOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductDescriptionGeneratorInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  category: z.string().describe('The category the product belongs to (e.g., "Dining Room Furniture", "Kitchen Appliances").'),
  material: z.string().optional().describe('The main materials the product is made from (e.g., "Solid Oak, Metal Frame", "Stainless Steel").'),
  keyFeatures: z.array(z.string()).optional().describe('A list of key features or selling points of the product.'),
  targetAudience: z.string().optional().describe('The intended target audience for the product (e.g., "Families looking for durable, stylish furniture", "Urban dwellers with limited space").'),
  tone: z.string().optional().describe('The desired tone for the description (e.g., "luxurious", "practical", "friendly").'),
});
export type ProductDescriptionGeneratorInput = z.infer<typeof ProductDescriptionGeneratorInputSchema>;

const ProductDescriptionGeneratorOutputSchema = z.object({
  description: z.string().describe('A comprehensive and engaging product description.'),
});
export type ProductDescriptionGeneratorOutput = z.infer<typeof ProductDescriptionGeneratorOutputSchema>;

export async function generateProductDescription(input: ProductDescriptionGeneratorInput): Promise<ProductDescriptionGeneratorOutput> {
  return productDescriptionGeneratorFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: ProductDescriptionGeneratorInputSchema},
  output: {schema: ProductDescriptionGeneratorOutputSchema},
  prompt: `You are an expert copywriter for Dwello, an e-commerce store specializing in furniture and home appliances.
Your task is to generate a comprehensive, engaging, and SEO-friendly product description based on the provided details.

Craft a description that highlights the product's benefits, unique selling points, and appeals to the target audience. The description should be engaging, informative, and persuasive, encouraging customers to make a purchase.

Product Name: {{{productName}}}
Category: {{{category}}}

{{#if material}}Material: {{{material}}}{{/if}}

{{#if keyFeatures}}
Key Features:
{{#each keyFeatures}}- {{{this}}}
{{/each}}
{{/if}}

{{#if targetAudience}}Target Audience: {{{targetAudience}}}{{/if}}

{{#if tone}}Maintain a {{{tone}}} tone throughout the description.{{/if}}

Generate a compelling product description in HTML format, ensuring it is well-structured with paragraphs and appropriate headings. Focus on clarity, persuasiveness, and highlight the product's value to the customer.`,
});

const productDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'productDescriptionGeneratorFlow',
    inputSchema: ProductDescriptionGeneratorInputSchema,
    outputSchema: ProductDescriptionGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);
