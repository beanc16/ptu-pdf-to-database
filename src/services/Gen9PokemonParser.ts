import { z } from 'zod';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { PokemonSpecies } from 'pokedex-promise-v2';

import { Pokemon } from '../dal/types/Responses.js';
import { getLlm } from '../helpers.js';
import { PokeApi } from './PokeApi.js';

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
- You will occasionally find a capability in the capabilities.other array called "Naturewalk" - if this exists, ensure that this is called "Naturewalk" rather than "Nature Walk", and includes the words in parenthesis after it as a part of the capability name as well, with a single space between "Naturewalk" and the first parenthesis.

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

    private static async getTranslationData(data: Gen9PokemonParserResponse[]): Promise<{
        pokemonNameToSpecies: Record<string, PokemonSpecies>;
        eggGroupNameToDisplayName: Record<string, string>;
    }>
    {
        // Get official pokemon species data
        const pokemonNames = data.map((cur) => cur.name);
        const [pokemon, eggGroups] = await Promise.all([
            PokeApi.getByNames(pokemonNames),
            PokeApi.getEggGroups(),
        ]);

        if (!pokemon)
        {
            throw new Error('Failed to get Pokémon from PokeApi');
        }

        if (!eggGroups)
        {
            throw new Error('Failed to get Pokémon Egg Groups from PokeApi');
        }

        // Convert to maps for faster lookup
        const pokemonNameToSpecies = pokemon.reduce<Record<string, PokemonSpecies>>((acc, cur) =>
        {
            acc[cur.name] = cur;
            return acc;
        }, {});
        const eggGroupNameToDisplayName = eggGroups.reduce<Record<string, string>>((acc, cur) =>
        {
            // Egg groups in the pokemon species api are lowercase and hyphenated
            // rather than being the display name. We want that as the key, with
            // the display name as the value.
            const { name, names } = cur;

            // Get the english display name of the egg group
            const { name: displayName } = names.find(({ language }) => language.name === 'en') ?? {};

            if (!displayName)
            {
                throw new Error(`Failed to find english display name for egg group: ${name}`);
            }

            acc[name] = displayName;
            return acc;
        }, {});

        return { pokemonNameToSpecies, eggGroupNameToDisplayName };
    }

    public static async translate(data: Gen9PokemonParserResponse[]): Promise<Pokemon[]>
    {
        const { pokemonNameToSpecies, eggGroupNameToDisplayName } = await this.getTranslationData(data);

        return data.map<Pokemon>((cur, index) =>
        {
            const startingIndex = parseInt(process.env.START_AT_PAGE_INDEX || '0', 10);
            const {
                egg_groups: speciesEggGroups,
                hatch_counter: hatchCounter,
                pokedex_numbers: speciesPokedexNumbers,
            } = pokemonNameToSpecies[cur.name];

            const eggGroups = speciesEggGroups.map(({ name }) => eggGroupNameToDisplayName[name]);

            const {
                entry_number: nationalPokedexNumber,
            } = speciesPokedexNumbers.find((cur) => cur.pokedex.name === 'national') || {};

            const averageHatchRate = (hatchCounter === 120)
                ? 75
                : (hatchCounter === 50)
                ? 30
                : (hatchCounter === 40)
                ? 25
                : (hatchCounter === 35)
                ? 20
                : (hatchCounter === 30)
                ? 16
                : (hatchCounter === 15)
                ? 7
                : (hatchCounter === 10)
                ? 4
                : (hatchCounter === 5)
                ? 2
                : (hatchCounter !== null)
                ? Math.round(hatchCounter / 2)
                : undefined;

            if (!nationalPokedexNumber)
            {
                console.error('Failed to find national pokedex number for', cur, pokemonNameToSpecies[cur.name]);
                throw new Error(`Failed to find national pokedex number for ${cur.name}`);
            }

            return {
                ...cur,
                sizeInformation: {
                    height: {
                        freedom: cur.sizeInformation.height.imperial,
                        metric: cur.sizeInformation.height.metric,
                        ptu: cur.sizeInformation.height.ptu,
                    },
                    weight: {
                        freedom: cur.sizeInformation.weight.imperial,
                        metric: cur.sizeInformation.weight.metric,
                        ptu: cur.sizeInformation.weight.ptu,
                    },
                },
                breedingInformation: {
                    genderRatio: {
                        male: cur.breedingInformation.genderRatio.male,
                        female: cur.breedingInformation.genderRatio.female,
                        ...(cur.breedingInformation.genderRatio.none ? { none: true } : {}),
                    },
                    eggGroups,
                    averageHatchRate: averageHatchRate?.toString(),
                },
                capabilities: {
                    overland: cur.capabilities.overland,
                    ...(cur.capabilities.swim ? { swim: cur.capabilities.swim } : {}),
                    ...(cur.capabilities.sky ? { sky: cur.capabilities.sky } : {}),
                    ...(cur.capabilities.levitate ? { levitate: cur.capabilities.levitate } : {}),
                    ...(cur.capabilities.burrow ? { burrow: cur.capabilities.burrow } : {}),
                    highJump: cur.capabilities.highJump,
                    lowJump: cur.capabilities.lowJump,
                    power: cur.capabilities.power,
                    ...(cur.capabilities.other ? { other: [...cur.capabilities.other] } : {}),
                },
                moveList: {
                    ...cur.moveList,
                    tutorMoves: cur.moveList.tmHm, // In Gen 9, tutor moves are the same as TM/HM moves
                    eggMoves: [],
                },
                metadata: {
                    source: 'Paldea Dex',
                    page: `p.${48 + index + startingIndex}`, // Pokemon start at page 48 in the gen 9 doc
                    dexNumber: `#${nationalPokedexNumber.toString()}`,
                },
            };
        });
    }
}
