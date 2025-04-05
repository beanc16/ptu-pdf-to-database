import type { Gen9PokemonParserResponse, GetTranslationDataResponse } from '../../../src/services/Gen9PokemonParser.js';

export const getFakePokemonTranslationData = ({
    hatchCounter = 10,
    pokedexName = 'national',
}: { hatchCounter?: number; pokedexName?: string } = {}): GetTranslationDataResponse =>
{
    return {
        pokemonNameToSpecies: {
            pikachu: {
                egg_groups: [{ name: 'field' }],
                hatch_counter: hatchCounter,
                pokedex_numbers: [{
                    pokedex: { name: pokedexName },
                    entry_number: 25,
                }],
            },
        },
        eggGroupNameToDisplayName: { field: 'Field' },
    } as unknown as GetTranslationDataResponse; // Typecast so we can mock only the data we care about
};

const defaultCapabilities = {
    overland: 7,
    highJump: 2,
    lowJump: 2,
    power: 2,
};

export const getFakeTranslateInput = ({
    name = 'pikachu',
    capabilities = {
        ...defaultCapabilities,
    },
    maleRatio = 50,
    femaleRatio = 50,
    shouldBeGenderless = false,
}: {
    name?: string;
    capabilities?: NonNullable<Partial<Gen9PokemonParserResponse['capabilities']>>;
    maleRatio?: number;
    femaleRatio?: number;
    shouldBeGenderless?: boolean;
} = {}): Gen9PokemonParserResponse[] =>
{
    return [{
        name,
        types: ['Electric'],
        baseStats: {
            hp: 4,
            attack: 6,
            defense: 4,
            specialAttack: 5,
            specialDefense: 5,
            speed: 9,
        },
        moveList: {
            levelUp: [
                {
                    level: 5,
                    move: 'Tail Whip',
                    type: 'Normal',
                },
                {
                    level: 13,
                    move: 'Electro Ball',
                    type: 'Electric',
                },
                {
                    level: 26,
                    move: 'Spark',
                    type: 'Electric',
                },
                {
                    level: 42,
                    move: 'Thunderbolt',
                    type: 'Electric',
                },
                {
                    level: 58,
                    move: 'Thunder',
                    type: 'Electric',
                },
            ],
            tmHm: ['Thunderbolt', 'Thunder', 'Charge Beam', 'Wild Charge'],
        },
        abilities: {
            basicAbilities: ['Static', 'Cute Charm'],
            advancedAbilities: ['Lightning Rod', 'Sprint'],
            highAbility: 'Sequence',
        },
        evolution: [
            {
                name: 'Pichu',
                level: 1,
                stage: 1,
            },
            {
                name: 'Pikachu',
                level: 10,
                stage: 2,
            },
            {
                name: 'Raichu Thunderstone',
                level: 20,
                stage: 3,
            },
        ],
        capabilities: {
            ...defaultCapabilities,
            ...(capabilities as any),
        },
        sizeInformation: {
            height: {
                imperial: `1'4"`,
                metric: '0.4m',
                ptu: 'Small',
            },
            weight: {
                imperial: '13.2lbs',
                metric: '6.0kg',
                ptu: 1,
            },
        },
        breedingInformation: {
            genderRatio: {
                ...(shouldBeGenderless
                    ? { none: true }
                    : {
                        male: maleRatio,
                        female: femaleRatio,
                    }
                ),
            },
        },
        diets: ['Herbivore'],
        habitats: ['Forest', 'Urban', 'Urban'],
        skills: {
            acrobatics: '3d6+1',
            athletics: '3d6',
            combat: '2d6',
            focus: '3d6+2',
            perception: '2d6+1',
            stealth: '3d6+1',
        },
    }];
};
