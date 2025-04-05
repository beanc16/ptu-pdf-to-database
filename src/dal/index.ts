import { PokemonController } from './PokemonController.js';
import { Pokemon } from './types/Responses.js';

export class Dal
{
    public static async insertPokemon(data: Pokemon[]): Promise<void>
    {
        await PokemonController.bulkWrite({
            inserts: data,
        });
    }
}
