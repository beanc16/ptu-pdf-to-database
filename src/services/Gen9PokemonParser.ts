import { z } from 'zod';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getLlm } from '../helpers.js';
import { Pokemon } from '../dal/types/Responses.js';

export type Gen9PokemonParserResponse = z.infer<typeof Gen9PokemonParser['schema']>;

export class Gen9PokemonParser
{
    /* istanbul ignore next */
    private static typeSchema = z.enum([
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

    /* istanbul ignore next */
    private static schema = z.object({
        name: z.string().describe('The name of the pokemon'),
        types: z.array(
            this.typeSchema.describe('The type of the pokemon'),
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
                    type: this.typeSchema.describe('The type of the move'),
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
        capabilities: z.object({
            overland: z.number().describe('The overland capability of the pokemon'),
            swim: z.union([z.number(), z.null()]).describe('The swim capability of the pokemon'),
            sky: z.union([z.number(), z.null()]).describe('The sky capability of the pokemon'),
            levitate: z.union([z.number(), z.null()]).describe('The levitate capability of the pokemon'),
            burrow: z.union([z.number(), z.null()]).describe('The burrow capability of the pokemon'),
            highJump: z.number().describe('The high jump capability of the pokemon. Maps to the first number of the Jump fraction.'),
            lowJump: z.number().describe('The low jump capability of the pokemon. Maps to the second number of the Jump fraction.'),
            power: z.number().describe('The power capability of the pokemon.'),
            other: z.union([
                z.array(z.string()).describe('The other capabilities of the pokemon'),
                z.null(),
            ]),
        }),
        sizeInformation: z.object({
            height: z.object({
                ptu: z.enum([
                    'Small',
                    'Medium',
                    'Large',
                    'Huge',
                    'Gigantic',
                ]).describe('The height of the pokemon in PTU units'),
                imperial: z.string().describe('The height of the pokemon in imperial units (ex: 4\'8\")'),
                metric: z.string().describe('The height of the pokemon in metric units (ex: 1.5m)'),
            }),
            weight: z.object({
                ptu: z.number().describe('The weight class of the pokemon'),
                imperial: z.string().describe('The weight of the pokemon in imperial units (ex: 54.5lbs)'),
                metric: z.string().describe('The weight of the pokemon in metric units (ex: 24.7kg)'),
            }),
        }),
        breedingInformation: z.object({
            genderRatio: z.object({
                male: z.number().describe('The male percentage of the pokemon'),
                female: z.number().describe('The female percentage of the pokemon'),
                none: z.union([z.boolean(), z.null()]).describe('Whether the pokemon is genderless or the gender ratio is unknown'),
            }),
        }),
        diets: z.array(z.string()).describe('The diets of the pokemon'),
        habitats: z.array(z.string()).describe('The habitats of the pokemon'),
        skills: z.object({
            athletics: z.string().describe('The Athletics (Athl) skill of the pokemon expressed in six-sided dice (ex: 2d6+3)'),
            acrobatics: z.string().describe('The Acrobatics (Acro) skill of the pokemon expressed in six-sided dice (ex: 2d6+3)'),
            combat: z.string().describe('The Combat skill of the pokemon expressed in six-sided dice (ex: 2d6+3)'),
            stealth: z.string().describe('The Stealth skill of the pokemon expressed in six-sided dice (ex: 2d6+3)'),
            perception: z.string().describe('The Perception (Percep) skill of the pokemon expressed in six-sided dice (ex: 2d6+3)'),
            focus: z.string().describe('The Focus (Focus) skill of the pokemon expressed in six-sided dice (ex: 2d6+3)'),
        })
    });

    /* istanbul ignore next */
    private static llm = getLlm(this.schema);

    /* istanbul ignore next */
    private static get systemInstructions()
    {
        return `You are an assistant that extracts structured data from unstructured Pokémon stat blocks formatted as continuous text. The input will be a raw string containing various categories of information about a Pokémon. Your task is to parse this input and return a JSON object that conforms to a structured output.
        
## Parsing Rules
- Recognize headers like "BaseStats", "Capabilities", "SkillList", and "MoveList" to categorize data correctly.
- Convert stat values and numerical fields to integers where applicable.
- If you find an unlabeled number in the middle of other stats, that is the pokemon's base stat total, which should remain unused and not be in the output.
- Extract move levels properly, ensuring move names and types are correctly mapped. Some levels may be recorded as the string, "Evo", rather than a number to signal that the move is learned upon evolution.
- Parse evolution information by recognizing stage numbers, Pokémon names, and level requirements. The first evolutionary stage should always be recorded as level 1.
- Handle spacing and irregular formatting to ensure correct data extraction.
- Ensure all arrays are properly structured and missing fields are either null or empty arrays, not undefined.
- You will occasionally find a capability in the capabilities.other array called "Naturewalk" - if this exists, ensure that this is called "Naturewalk" rather than "Nature Walk".

Return only the structured JSON output without extra commentary.`;
    }

    /* istanbul ignore next */
    public static async parse(page: string): Promise<Gen9PokemonParserResponse>
    {
        const promptTemplate = ChatPromptTemplate.fromMessages([
            new SystemMessage(this.systemInstructions),
            new HumanMessage(page),
        ]);

        const chain = promptTemplate.pipe(this.llm);

        return await chain.invoke({});
    }

    public static async translate(data: Gen9PokemonParserResponse[]): Promise<Pokemon[]>
    {
        // TODO: Add translation logic
        return [];
    }
}
