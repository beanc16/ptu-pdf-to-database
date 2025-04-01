import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const typeSchema = z.enum([
    'Bug',
    'Dark',
    'Dragon',
    'Electric',
    'Fairy',
    'Fighting',
    'Fire',
    'Flying',
    'Ghost',
    'Grass',
    'Ground',
    'Ice',
    'Normal',
    'Poison',
    'Psychic',
    'Rock',
    'Steel',
    'Water',
]);

export class Gen9PokemonParser
{
    private static schema = z.object({
        name: z.string().describe('The name of the pokemon'),
        types: z.array(
            typeSchema.describe('The type of the pokemon'),
        ).describe('The types of the pokemon'),
        baseStats: z.object({
            hp: z.number().describe('The base HP of the pokemon'),
            attack: z.number().describe('The base attack (ATK) of the pokemon'),
            defense: z.number().describe('The base defense (DEF) of the pokemon'),
            specialAttack: z.number().describe('The base special attack (Sp.ATK) of the pokemon'),
            specialDefense: z.number().describe('The base special defense (Sp.DEF) of the pokemon'),
            speed: z.number().describe('The base speed (SPD) of the pokemon'),
        }),
        moveList: z.object({
            levelUp: z.array(
                z.object({
                    move: z.string().describe('The name of the move'),
                    level: z.union([z.string(), z.number()]).describe('The level of the move'),
                    type: typeSchema.describe('The type of the move'),
                }),
            ).describe('The level up move list of the pokemon'),
            tmHm: z.array(
                z.string().describe('The name of the move'),
            ).describe('The TM/Tutor move list of the pokemon'),
        }).describe('The move list of the pokemon'),
        abilities: z.object({
            basicAbilities: z.array(z.string()).describe('The basic abilities of the pokemon'),
            advancedAbilities: z.array(z.string()).describe('The advanced abilities of the pokemon'),
            highAbility: z.string().describe('The high ability of the pokemon'),
        }),
        evolution: z.array(
            z.object({
                name: z.string().describe('The name of the evolution'),
                level: z.number().describe('The level of the evolution'),
                stage: z.number().describe('The stage of the evolution'),
            }),
        ),
    });

    private static get systemInstructions()
    {
        return `You are an assistant that extracts structured data from unstructured Pokémon stat blocks formatted as continuous text. The input will be a raw string containing various categories of information about a Pokémon. Your task is to parse this input and return a JSON object that conforms to a structured output.
        
## Parsing Rules
- Recognize headers like "BaseStats", "Capabilities", "SkillList", and "MoveList" to categorize data correctly.
- Convert stat values and numerical fields to integers where applicable.
- Extract move levels properly, ensuring move names and types are correctly mapped.
- Parse evolution information by recognizing stage numbers, Pokémon names, and level requirements.
- Handle spacing and irregular formatting to ensure correct data extraction.
- Ensure all arrays are properly structured and missing fields are either null or empty arrays, not undefined.

Return only the structured JSON output without extra commentary.`;
    }

    public static async parse(pages: string[]): Promise<void>
    {
        const llm = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4o-mini',
        }).withStructuredOutput(this.schema);

        const promptTemplate = ChatPromptTemplate.fromMessages([
            new SystemMessage(this.systemInstructions),
            new HumanMessage(pages[0]), // TODO: Handle other pages later
        ]);

        const chain = promptTemplate.pipe(llm);

        const result = await chain.invoke({});

        console.log('\n result:', JSON.stringify(result, null, 2));
    }
}
