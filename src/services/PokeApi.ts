import Pokedex from 'pokedex-promise-v2';


export class PokeApi
{
    private static api = new Pokedex();

    public static parseName(name?: string): string | undefined
    {
        if (!name)
        {
            return undefined;
        }

        let parsedName = name.toLowerCase()
            // Remove parenthesis
            .replaceAll('(', '')
            .replaceAll(')', '')
            // Replace spaces with hyphens
            .replaceAll(' ', '-')
            // Replace characters in some names with nothing
            .replaceAll(':', '')
            .replaceAll('.', '')
            .replaceAll(`'`, '')
            .replaceAll('é', 'e')
            // Replace variant names
            .replaceAll('galarian', 'galar')
            .replaceAll('hisuian', 'hisui')
            .replaceAll('alolan', 'alola')
            .replaceAll('paldean', 'paldea')
            // Fix specific pokemon
            .replaceAll('aegislash', 'aegislash-blade')
            .replaceAll('basculin', 'basculin-red-striped')
            .replaceAll('calyrex-ice-rider', 'calyrex-ice')
            .replaceAll('calyrex-shadow-rider', 'calyrex-shadow')
            .replaceAll('darmanitan-galar', 'darmanitan-galar-standard')
            .replaceAll('darmanitan-galar-standard-zen', 'darmanitan-galar-zen') // Undo the previous replace all if it's zen mode
            .replaceAll('eiscue-ice-face', 'eiscue-ice')
            .replaceAll('eiscue-noice-face', 'eiscue-noice')
            .replaceAll('hoopa-confined', 'hoopa')
            .replaceAll('keldeo', 'keldeo-ordinary')
            .replaceAll('kyurem-zekrom', 'kyurem-black')
            .replaceAll('kyurem-reshiram', 'kyurem-white')
            .replaceAll('meloetta-step', 'meloetta-pirouette')
            .replaceAll('mimikyu', 'mimikyu-disguised')
            .replaceAll('minior-core', 'minior-red')
            .replaceAll('minior-meteor', 'minior-red-meteor')
            .replaceAll('morpeko', 'morpeko-full-belly')
            .replaceAll('necrozma-dawn-wings', 'necrozma-dawn')
            .replaceAll('necrozma-dusk-mane', 'necrozma-dusk')
            .replaceAll('nidoran-female', 'nidoran-f')
            .replaceAll('nidoran-male', 'nidoran-m')
            .replaceAll('oinkologne-female', 'oinkologne')      // For pokemon-species only, not pokemon
            .replaceAll('oinkologne-male', 'oinkologne')        // For pokemon-species only, not pokemon
            .replaceAll('oricorio', 'oricorio-baile')
            .replaceAll('palafin-hero', 'palafin')              // For pokemon-species only, not pokemon
            .replaceAll('palafin-zero', 'palafin')              // For pokemon-species only, not pokemon
            .replaceAll('tauros-paldea-aqua-breed', 'tauros')   // For pokemon-species only, not pokemon
            .replaceAll('tauros-paldea-blaze-breed', 'tauros')  // For pokemon-species only, not pokemon
            .replaceAll('tauros-paldea-combat-breed', 'tauros') // For pokemon-species only, not pokemon
            .replaceAll('ursaluna-bloodmoon', 'ursaluna')
            .replaceAll('wishiwashi-schooling', 'wishiwashi-school')
            .replaceAll('wooper-paldea', 'wooper')              // For pokemon-species only, not pokemon
            .replaceAll('zacian-crowned-sword', 'zacian-crowned')
            .replaceAll('zamazenta-crowned-shield', 'zamazenta-crowned')
            .replaceAll('zacian-hero', 'zacian')
            .replaceAll('zamazenta-hero', 'zamazenta');

        if (parsedName === 'darmanitan')
        {
            parsedName += '-standard';
        }
        else if (parsedName === 'wishiwashi')
        {
            parsedName += '-solo';
        }
        else if (parsedName === 'zygarde')
        {
            parsedName += '-50';
        }

        return parsedName;
    }

    /* istanbul ignore next */
    public static parseNames(names?: string[]): string[]
    {
        const parsedNames = names?.reduce<string[]>((acc, name) =>
        {
            const parsedName = this.parseName(name);

            if (parsedName)
            {
                acc.push(parsedName);
            }
            else
            {
                console.warn('Failed to parse name:', name);
            }

            return acc;
        }, []);

        return parsedNames || [];
    }

    /* istanbul ignore next */
    public static async getByNames(names?: string[]): Promise<Pokedex.PokemonSpecies[] | undefined>
    {
        const parsedNames = this.parseNames(names);

        // Get pokemon from PokeApi
        try
        {
            return await this.api.getPokemonSpeciesByName(parsedNames);
        }
        catch (err)
        {
            console.error('Failed to get Pokémon by name from PokeApi', {
                names,
                parsedNames,
            }, err);
            return undefined;
        }
    }

    /* istanbul ignore next */
    public static async getEggGroups(): Promise<Pokedex.EggGroup[] | undefined>
    {
        try
        {
            // Get all egg group names
            const { results } = await this.api.getEggGroupsList();
            const eggGroupNames = results.map(({ name }) => name);
            
            // Get all egg groups
            const eggGroups = await this.api.getEggGroupByName(eggGroupNames);
            return eggGroups;
        }
        catch (err)
        {
            console.error('Failed to get egg groups from PokeApi', err);
            return undefined;
        }
    }
}
