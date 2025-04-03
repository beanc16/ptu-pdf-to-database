import { Gen9PokemonParser, Gen9PokemonParserResponse } from '../../src/services/Gen9PokemonParser.js';
import { getFakePokemonTranslationData, getFakeTranslateInput } from './fakes/gen9PokemonParserFakes.js';
import { PokeApi } from '../../src/services/PokeApi.js';
import { Pokemon } from '../../src/dal/types/Responses.js';

jest.mock('pokedex-promise-v2', () =>
{
    return {
        __esmodule: true,
        default: jest.fn().mockImplementation(() =>
        {
            return {
                Pokedex: jest.fn().mockImplementation(() =>
                {
                    return {
                        getPokemonByName: jest.fn(),
                    };
                }),
            };
        }),
    };
});

describe('Gen9PokemonParser', () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });
    
    describe('getTranslationData', () =>
    {
        it('should return correct translation data', async () =>
        {
            const mockedGetByNamesResult = {
                name: 'pikachu',
                egg_groups: [{ name: 'field' }],
                hatch_counter: 10,
                pokedex_numbers: [{
                    pokedex: { name: 'national' },
                    entry_number: 25,
                }],
            };
            jest.spyOn(PokeApi, 'getByNames').mockResolvedValue([
                mockedGetByNamesResult as any,
            ]); // Typecast to any so we can mock only the data we care about

            jest.spyOn(PokeApi, 'getEggGroups').mockResolvedValue([{
                name: 'field',
                names: [{
                    name: 'Field',
                    language: { name: 'en' },
                }],
            } as any]); // Typecast to any so we can mock only the data we care about

            const result = await Gen9PokemonParser['getTranslationData']([{
                name: 'pikachu',
            }]);

            expect(result).toEqual({
                pokemonNameToSpecies: { pikachu: mockedGetByNamesResult },
                eggGroupNameToDisplayName: { field: 'Field' },
            });
        });

        it('should throw an error when PokeApi fails to get names', async () =>
        {
            jest.spyOn(PokeApi, 'getByNames').mockResolvedValue(undefined);
            jest.spyOn(PokeApi, 'getEggGroups').mockResolvedValue([]);
            await expect(Gen9PokemonParser['getTranslationData']([{
                name: 'pikachu',
            }])).rejects.toThrow();
        });

        it('should throw an error when PokeApi fails to get egg groups', async () =>
        {
            jest.spyOn(PokeApi, 'getByNames').mockResolvedValue([]);
            jest.spyOn(PokeApi, 'getEggGroups').mockResolvedValue(undefined);
            await expect(Gen9PokemonParser['getTranslationData']([{
                name: 'pikachu',
            }])).rejects.toThrow();
        });

        it('should throw an error when PokeApi does not return an English egg groups', async () =>
        {
            jest.spyOn(PokeApi, 'getByNames').mockResolvedValue([{
                name: 'pikachu',
                egg_groups: [{ name: 'field' }],
                hatch_counter: 10,
                pokedex_numbers: [{
                    pokedex: { name: 'national' },
                    entry_number: 25,
                }],
            } as any]); // Typecast to any so we can mock only the data we care about

            jest.spyOn(PokeApi, 'getEggGroups').mockResolvedValue([{
                name: 'field',
                names: [{
                    name: 'Field',
                    language: { name: 'fr' }, // <-- Not English
                }],
            } as any]); // Typecast to any so we can mock only the data we care about

            await expect(Gen9PokemonParser['getTranslationData']([{
                name: 'pikachu',
            }])).rejects.toThrow();
        });
    });

    describe('formatOtherCapabilities', () =>
    {
        it('should output an empty array if no other capabilities are given', () =>
        {
            const result = Gen9PokemonParser['formatOtherCapabilities']([]);
            expect(result).toEqual([]);
        });

        it('should output the input array if a Naturewalk capability is not given', () =>
        {
            const result = Gen9PokemonParser['formatOtherCapabilities']([
                'Underdog',
                'Firestarter',
                'Egg Warmer',
            ]);
            expect(result).toEqual(['Underdog', 'Firestarter', 'Egg Warmer']);
        });

        it('should format Naturewalk capability with proper spacing', () =>
        {
            const result = Gen9PokemonParser['formatOtherCapabilities']([
                'Naturewalk (Mountain)',                    // One proper format
                'Naturewalk (Forest, Grasslands)',          // Two proper formats
                'Naturewalk(Mountain)',                     // One improper format
                'Naturewalk(Forest,Grasslands)',            // Two improper formats
                'Naturewalk (Forest,Grasslands)',           // Two mixed improper formats
                'Naturewalk(Forest, Grasslands)',           // Two mixed improper formats
                'Naturewalk (Forest, Grasslands, Mountain)',// Three proper formats
                'Naturewalk(Forest,Grasslands,Mountain)',   // Three improper formats
                'Naturewalk (Forest,Grasslands,Mountain)',  // Three mixed improper formats
                'Naturewalk( Forest,Grasslands,Mountain)',  // Three improper formats
                'Naturewalk(Forest, Grasslands,Mountain)',  // Three mixed improper formats
                'Naturewalk(Forest,Grasslands, Mountain)',  // Three mixed improper formats
                'Naturewalk(Forest,Grasslands,Mountain )',  // Three mixed improper formats
                'Naturewalk ( Forest,Grasslands,Mountain)', // Three mixed improper formats
                'Naturewalk (Forest, Grasslands,Mountain)', // Three mixed improper formats
                'Naturewalk (Forest,Grasslands, Mountain)', // Three mixed improper formats
                'Naturewalk (Forest,Grasslands,Mountain )', // Three mixed improper formats
                'Naturewalk ( Forest, Grasslands,Mountain)',// Three mixed improper formats
                'Naturewalk ( Forest,Grasslands, Mountain)',// Three mixed improper formats
                'Naturewalk (Forest, Grasslands, Mountain)',// Three mixed improper formats
                // 'Naturewalk   (  Forest,  Grasslands  )',   // Two mixed improper formats with extra spacing
            ]);
            expect(result).toEqual([
                'Naturewalk (Mountain)',
                'Naturewalk (Forest, Grasslands)',
                'Naturewalk (Mountain)',
                'Naturewalk (Forest, Grasslands)',
                'Naturewalk (Forest, Grasslands)',
                'Naturewalk (Forest, Grasslands)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                'Naturewalk (Forest, Grasslands, Mountain)',
                // 'Naturewalk (Forest, Grasslands)',
            ]);
        });

        it('should handle a mix of Naturewalk and non-Naturewalk capabilities', () =>
        {
            const result = Gen9PokemonParser['formatOtherCapabilities']([
                'Naturewalk(Forest,Grasslands)',
                'Underdog',
                'Firestarter',
                'Naturewalk(Mountain)',
                'Egg Warmer',
                'Naturewalk (Mountain)',
            ]);
            expect(result).toEqual([
                'Naturewalk (Forest, Grasslands)',
                'Underdog',
                'Firestarter',
                'Naturewalk (Mountain)',
                'Egg Warmer',
                'Naturewalk (Mountain)',
            ]);
        });

        it('should handle edge cases with extra spaces and capitalization', () =>
        {
            const result = Gen9PokemonParser['formatOtherCapabilities']([
                'nATuRewaLk  (  foREsT,  grAsSlaNDs  )',
            ]);
            expect(result).toEqual([
                'Naturewalk (Forest, Grasslands)',
            ]);
        });
    });

    describe('parsePokemonTranslationData', () =>
    {
        it('should correctly parse Pokémon translation data', () =>
        {
            const data = { name: 'pikachu' };
            const translationData = getFakePokemonTranslationData();

            const response = Gen9PokemonParser['parsePokemonTranslationData'](data, translationData as any);
            
            expect(response).toEqual({
                eggGroups: ['Field'],
                nationalPokedexNumber: 25,
                averageHatchRate: 4,
            });
        });

        it('should return undefined national pokedex number if not found', () =>
        {
            const data = { name: 'pikachu' };
            const translationData = getFakePokemonTranslationData({ pokedexName: 'other' });

            const response = Gen9PokemonParser['parsePokemonTranslationData'](data, translationData as any);
            
            expect(response.nationalPokedexNumber).toBeUndefined();
        });

        it.each([
            [120, 75],
            [100, 50],
            [80, 40],
            [50, 30],
            [40, 25],
            [35, 20],
            [30, 16],
            [15, 7],
            [10, 4],
            [5, 2],
        ])('should correctly parse Pokémon hatch counter of %s to average hatch rate of %s', (hatchCounter, averageHatchRate) =>
        {
            const data = { name: 'pikachu' };
            const translationData = getFakePokemonTranslationData({ hatchCounter });

            const result = Gen9PokemonParser['parsePokemonTranslationData'](data, translationData as any);
            
            expect(result.averageHatchRate).toEqual(averageHatchRate);
        });
    });

    describe('translate', () =>
    {
        describe('valid data', () =>
        {
            const mockedParsePokemonTranslationDataResponse = {
                averageHatchRate: 4,
                eggGroups: ['Field', 'Fairy'],
                nationalPokedexNumber: 25,
            };

            beforeEach(() =>
            {
                jest.spyOn(Gen9PokemonParser as any, 'getTranslationData').mockResolvedValue({
                    pokemonNameToSpecies: {
                        pikachu: {
                            egg_groups: [{ name: 'field' }],
                            hatch_counter: 10,
                            pokedex_numbers: [{
                                pokedex: { name: 'national' },
                                entry_number: 25,
                            }],
                        },
                    },
                    eggGroupNameToDisplayName: { field: 'Field' },
                });
                jest.spyOn(Gen9PokemonParser as any, 'parsePokemonTranslationData').mockReturnValue(
                    mockedParsePokemonTranslationDataResponse,
                );
            });

            it('should translate Pokémon data correctly', async () =>
            {
                const input = getFakeTranslateInput({
                    capabilities: {
                        overland: 7,
                        highJump: 2,
                        lowJump: 2,
                        power: 2,
                        swim: 2,
                        burrow: 0,
                        levitate: 0,
                        sky: 0,
                        other: [
                            'Naturewalk (Forest, Urban)',
                            'Zapper',
                            'Underdog',
                        ],
                    },
                });
                const response = await Gen9PokemonParser.translate(input);
                
                expect(response).toEqual([{
                    ...input[0],
                    capabilities: {
                        overland: input[0].capabilities.overland,
                        swim: input[0].capabilities.swim,
                        highJump: input[0].capabilities.highJump,
                        lowJump: input[0].capabilities.lowJump,
                        power: input[0].capabilities.power,
                        other: input[0].capabilities.other,
                    },
                    sizeInformation: {
                        height: {
                            freedom: input[0].sizeInformation.height.imperial,
                            metric: input[0].sizeInformation.height.metric,
                            ptu: input[0].sizeInformation.height.ptu,
                        },
                        weight: {
                            freedom: input[0].sizeInformation.weight.imperial,
                            metric: input[0].sizeInformation.weight.metric,
                            ptu: input[0].sizeInformation.weight.ptu,
                        },
                    },
                    breedingInformation: {
                        genderRatio: {
                            male: (input[0].breedingInformation.genderRatio as any).male,
                            female: (input[0].breedingInformation.genderRatio as any).female,
                        },
                        eggGroups: mockedParsePokemonTranslationDataResponse.eggGroups,
                        averageHatchRate: `${mockedParsePokemonTranslationDataResponse.averageHatchRate.toString()} Days`,
                    },
                    moveList: {
                        ...input[0].moveList,
                        tutorMoves: input[0].moveList.tmHm,
                        eggMoves: [],
                    },
                    metadata: {
                        source: 'Paldea Dex',
                        page: 'p.48',
                        dexNumber: `#${mockedParsePokemonTranslationDataResponse.nationalPokedexNumber.toString()}`,
                    },
                } as Pokemon]);
            });

            it('should not include male/female gender ratio if the Pokémon is genderless', async () =>
            {
                const input = getFakeTranslateInput({ shouldBeGenderless: true });
                const response = await Gen9PokemonParser.translate(input);

                response.forEach((pokemon) =>
                {
                    expect(pokemon.breedingInformation.genderRatio).toEqual({
                        none: true,
                    });
                });
            });

            it('should mark Pokémon as genderless if male/female gender ratio does not add up to 100%', async () =>
            {
                const input = getFakeTranslateInput({ maleRatio: 0, femaleRatio: 0 });
                const response = await Gen9PokemonParser.translate(input);

                response.forEach((pokemon) =>
                {
                    expect(pokemon.breedingInformation.genderRatio).toEqual({
                        none: true,
                    });
                });
            });

            it.each(
                [
                    ['swim', 1],
                    ['sky', 1],
                    ['levitate', 1],
                    ['burrow', 1],
                    ['other', ['Underdog']],
                ] as [keyof Gen9PokemonParserResponse['capabilities'], number | string[]][]
            )('should only include %s capability if it is defined', async (capabilityKey, value) =>
            {
                const input = getFakeTranslateInput({
                    capabilities: {
                        [capabilityKey]: value,
                    },
                });
                const response = await Gen9PokemonParser.translate(input);

                response.forEach((pokemon) =>
                {
                    expect(pokemon.capabilities[capabilityKey]).toEqual(value);
                });
            });
        });

        it('should throw error if national pokedex number is not found', async () =>
        {
            jest.spyOn(Gen9PokemonParser as any, 'getTranslationData').mockResolvedValue({
                pokemonNameToSpecies: {
                    pikachu: {},
                },
            });
            jest.spyOn(Gen9PokemonParser as any, 'parsePokemonTranslationData').mockReturnValue({
                nationalPokedexNumber: undefined,
            });

            await expect(Gen9PokemonParser.translate([{
                name: 'pikachu',
            } as any])).rejects.toThrow(
                `Failed to find national pokedex number for pikachu`,
            );
        });
    });
});
