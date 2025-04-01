import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export const getLlm = (schema: z.ZodSchema) =>
{
    const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
    });
    
    return llm.withStructuredOutput(schema)
};
