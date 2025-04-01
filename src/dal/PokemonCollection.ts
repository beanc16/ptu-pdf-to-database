import { ObjectId } from 'mongodb';
import { Pokemon } from './types/Responses.js';
import { WithId } from './types/WithId.js';

export class PokemonCollection implements Pokemon, WithId
{
    public _id: ObjectId;
    public name: Pokemon['name'];
    public types: Pokemon['types'];
    public baseStats: Pokemon['baseStats'];
    public abilities: Pokemon['abilities'];
    public evolution: Pokemon['evolution'];
    public sizeInformation: Pokemon['sizeInformation'];
    public breedingInformation: Pokemon['breedingInformation'];
    public diets: Pokemon['diets'];
    public habitats: Pokemon['habitats'];
    public capabilities: Pokemon['capabilities'];
    public skills: Pokemon['skills'];
    public moveList: Pokemon['moveList'];
    public megaEvolutions: Pokemon['megaEvolutions'];
    public metadata: Pokemon['metadata'];
    public extras: Pokemon['extras'];

    constructor({
        _id,
        name,
        types,
        baseStats,
        abilities,
        evolution,
        sizeInformation,
        breedingInformation,
        diets,
        habitats,
        capabilities,
        skills,
        moveList,
        megaEvolutions,
        metadata,
        extras,
    }: Pokemon & WithId)
    {
        if (_id)
        {
            this._id = _id;
        }
        else
        {
            this._id = new ObjectId();
        }

        this.name = name;
        this.types = types;
        this.baseStats = baseStats;
        this.abilities = abilities;
        this.evolution = evolution;
        this.sizeInformation = sizeInformation;
        this.breedingInformation = breedingInformation;
        this.diets = diets;
        this.habitats = habitats;
        this.capabilities = capabilities;
        this.skills = skills;
        this.moveList = moveList;
        this.megaEvolutions = megaEvolutions;
        this.metadata = metadata;
        this.extras = extras;
    }

    public isEqual(pokemon: Pokemon): boolean
    {
        if (
            // Name
            this.name !== pokemon.name

            // Types
            || this.types.length !== pokemon.types.length || !this.types.every(type => pokemon.types.includes(type))

            // Base Stats
            || this.baseStats.hp !== pokemon.baseStats.hp
            || this.baseStats.attack !== pokemon.baseStats.attack
            || this.baseStats.defense !== pokemon.baseStats.defense
            || this.baseStats.specialAttack !== pokemon.baseStats.specialAttack
            || this.baseStats.specialDefense !== pokemon.baseStats.specialDefense
            || this.baseStats.speed !== pokemon.baseStats.speed

            // Abilities
            || this.abilities.basicAbilities.length !== pokemon.abilities.basicAbilities.length
            || !this.abilities.basicAbilities.every(ability => pokemon.abilities.basicAbilities.includes(ability))
            || this.abilities.advancedAbilities.length !== pokemon.abilities.advancedAbilities.length
            || !this.abilities.advancedAbilities.every(ability => pokemon.abilities.advancedAbilities.includes(ability))
            || this.abilities.highAbility !== pokemon.abilities.highAbility

            // Evolution
            || this.evolution.length !== pokemon.evolution.length
            && !this.evolution.every(({ name, level, stage }) =>
            {
                const pokemonEvolution = pokemon.evolution.find(({ name: pokemonName }) => pokemonName === name);
                return pokemonEvolution?.level === level && pokemonEvolution?.stage === stage;
            })

            // Size Information
            || this.sizeInformation.height.freedom !== pokemon.sizeInformation.height.freedom
            || this.sizeInformation.height.metric !== pokemon.sizeInformation.height.metric
            || this.sizeInformation.height.ptu !== pokemon.sizeInformation.height.ptu
            || this.sizeInformation.weight.freedom !== pokemon.sizeInformation.weight.freedom
            || this.sizeInformation.weight.metric !== pokemon.sizeInformation.weight.metric
            || this.sizeInformation.weight.ptu !== pokemon.sizeInformation.weight.ptu

            // Breeding Information
            || this.breedingInformation.genderRatio.male !== pokemon.breedingInformation.genderRatio.male
            || this.breedingInformation.genderRatio.female !== pokemon.breedingInformation.genderRatio.female
            || this.breedingInformation.genderRatio.none !== pokemon.breedingInformation.genderRatio.none
            || this.breedingInformation.eggGroups.length !== pokemon.breedingInformation.eggGroups.length
            || !this.breedingInformation.eggGroups.every(group => pokemon.breedingInformation.eggGroups.includes(group))
            || this.breedingInformation.averageHatchRate !== pokemon.breedingInformation.averageHatchRate

            // Diets
            || this.diets.length !== pokemon.diets.length
            || !this.diets.every(diet => pokemon.diets.includes(diet))

            // Habitats
            || this.habitats.length !== pokemon.habitats.length
            || !this.habitats.every(habitat => pokemon.habitats.includes(habitat))

            // Capabilities
            || this.capabilities.overland !== pokemon.capabilities.overland
            || this.capabilities.swim !== pokemon.capabilities.swim
            || this.capabilities.sky !== pokemon.capabilities.sky
            || this.capabilities.levitate !== pokemon.capabilities.levitate
            || this.capabilities.burrow !== pokemon.capabilities.burrow
            || this.capabilities.highJump !== pokemon.capabilities.highJump
            || this.capabilities.lowJump !== pokemon.capabilities.lowJump
            || this.capabilities.power !== pokemon.capabilities.power
            || this.capabilities.other?.length !== pokemon.capabilities.other?.length
            || !(this.capabilities.other ?? []).every(capability => (pokemon.capabilities.other ?? []).includes(capability))

            // Skills
            || this.skills.athletics !== pokemon.skills.athletics
            || this.skills.acrobatics !== pokemon.skills.acrobatics
            || this.skills.combat !== pokemon.skills.combat
            || this.skills.stealth !== pokemon.skills.stealth
            || this.skills.perception !== pokemon.skills.perception
            || this.skills.focus !== pokemon.skills.focus

            // Move List
            || this.moveList.levelUp.length !== pokemon.moveList.levelUp.length
            || !this.moveList.levelUp.every(move =>
            {
                return pokemon.moveList.levelUp.some(({ level, move: name, type }) =>
                {
                    return move.level === level && move.move === name && move.type === type;
                });
            })
            || this.moveList.tmHm.length !== pokemon.moveList.tmHm.length
            || !this.moveList.tmHm.every(move => pokemon.moveList.tmHm.includes(move))
            || this.moveList.eggMoves.length !== pokemon.moveList.eggMoves.length
            || !this.moveList.eggMoves.every(move => pokemon.moveList.eggMoves.includes(move))
            || this.moveList.tutorMoves.length !== pokemon.moveList.tutorMoves.length
            || !this.moveList.tutorMoves.every(move => pokemon.moveList.tutorMoves.includes(move))
            || this.moveList.zygardeCubeMoves?.length !== pokemon.moveList.zygardeCubeMoves?.length
            || !(this.moveList.zygardeCubeMoves ?? []).every(move => (pokemon.moveList.zygardeCubeMoves ?? []).includes(move))

            // Mega Evolutions
            || this.megaEvolutions?.some((megaEvolution) =>
            {
                return !pokemon.megaEvolutions?.some(({
                    name,
                    types,
                    ability,
                    abilityShift,
                    capabilities,
                    stats,
                }) =>
                {
                    return (
                        megaEvolution.name === name
                        && megaEvolution.types.every((type, index) => type === types[index])
                        && megaEvolution.ability === ability
                        && megaEvolution?.abilityShift === abilityShift
                        && (megaEvolution?.capabilities ?? []).every((capability, index) => capability === capabilities?.[index])
                        && megaEvolution.stats.hp === stats.hp
                        && megaEvolution.stats.attack === stats.attack
                        && megaEvolution.stats.defense === stats.defense
                        && megaEvolution.stats.specialAttack === stats.specialAttack
                        && megaEvolution.stats.specialDefense === stats.specialDefense
                        && megaEvolution.stats.speed === stats.speed
                    );
                });
            })

            // Metadata
            || this.metadata.dexNumber !== pokemon.metadata.dexNumber
            || this.metadata.source !== pokemon.metadata.source
            || this.metadata.page !== pokemon.metadata.page

            // Extras
            || !(this.extras ?? []).every((extra, index) =>
                extra.name === pokemon.extras?.[index]?.name
                || extra.value === pokemon.extras?.[index]?.value
            )
        )
        {
            return false;
        }

        return true;
    }

    public getDifference(pokemon: Pokemon): Pokemon
    {
        // @ts-ignore -- For only including values that are different
        const output: Pokemon = { name: pokemon.name }; // Always include name

        // Types
        if (
            this.types.length !== pokemon.types.length
            || !this.types.every(type => pokemon.types.includes(type))
        )
        {
            output.types = pokemon.types;
        }

        // Base Stats
        if (
            this.baseStats.hp !== pokemon.baseStats.hp
            || this.baseStats.attack !== pokemon.baseStats.attack
            || this.baseStats.defense !== pokemon.baseStats.defense
            || this.baseStats.specialAttack !== pokemon.baseStats.specialAttack
            || this.baseStats.specialDefense !== pokemon.baseStats.specialDefense
            || this.baseStats.speed !== pokemon.baseStats.speed
        )
        {
            output.baseStats = pokemon.baseStats;
        }

        // Abilities
        if (
            this.abilities.basicAbilities.length !== pokemon.abilities.basicAbilities.length
            || this.abilities.advancedAbilities.length !== pokemon.abilities.advancedAbilities.length
            || this.abilities.highAbility !== pokemon.abilities.highAbility)
        {
            output.abilities = pokemon.abilities;
        }

        // Evolution
        if (
            this.evolution.length !== pokemon.evolution.length
            && !this.evolution.every(({ name, level, stage }) =>
            {
                const pokemonEvolution = pokemon.evolution.find(({ name: pokemonName }) => pokemonName === name);
                return pokemonEvolution?.level === level && pokemonEvolution?.stage === stage;
            })
        )
        {
            output.evolution = pokemon.evolution;
        }

        // Size Information
        if (
            this.sizeInformation.height.freedom !== pokemon.sizeInformation.height.freedom
            || this.sizeInformation.height.metric !== pokemon.sizeInformation.height.metric
            || this.sizeInformation.height.ptu !== pokemon.sizeInformation.height.ptu
            || this.sizeInformation.weight.freedom !== pokemon.sizeInformation.weight.freedom
            || this.sizeInformation.weight.metric !== pokemon.sizeInformation.weight.metric
            || this.sizeInformation.weight.ptu !== pokemon.sizeInformation.weight.ptu
        )
        {
            output.sizeInformation = pokemon.sizeInformation;
        }

        // Breeding Information
        if (
            this.breedingInformation.genderRatio.male !== pokemon.breedingInformation.genderRatio.male
            || this.breedingInformation.genderRatio.female !== pokemon.breedingInformation.genderRatio.female
            || this.breedingInformation.genderRatio.none !== pokemon.breedingInformation.genderRatio.none
            || this.breedingInformation.eggGroups.length !== pokemon.breedingInformation.eggGroups.length
            || !this.breedingInformation.eggGroups.every(group => pokemon.breedingInformation.eggGroups.includes(group))
            || this.breedingInformation.averageHatchRate !== pokemon.breedingInformation.averageHatchRate
        )
        {
            output.breedingInformation = pokemon.breedingInformation;
        }

        // Diets
        if (this.diets.length !== pokemon.diets.length || !this.diets.every(diet => pokemon.diets.includes(diet)))
        {
            output.diets = pokemon.diets;
        }

        // Habitats
        if (this.habitats.length !== pokemon.habitats.length || !this.habitats.every(habitat => pokemon.habitats.includes(habitat)))
        {
            output.habitats = pokemon.habitats;
        }

        // Capabilities
        if (
            this.capabilities.overland !== pokemon.capabilities.overland
            || this.capabilities.swim !== pokemon.capabilities.swim
            || this.capabilities.sky !== pokemon.capabilities.sky
            || this.capabilities.levitate !== pokemon.capabilities.levitate
            || this.capabilities.burrow !== pokemon.capabilities.burrow
            || this.capabilities.highJump !== pokemon.capabilities.highJump
            || this.capabilities.lowJump !== pokemon.capabilities.lowJump
            || this.capabilities.power !== pokemon.capabilities.power
            || this.capabilities.other?.length !== pokemon.capabilities.other?.length
            || !(this.capabilities.other ?? []).every(capability => (pokemon.capabilities.other ?? []).includes(capability))
        )
        {
            output.capabilities = pokemon.capabilities;
        }

        // Skills
        if (
            this.skills.athletics !== pokemon.skills.athletics
            || this.skills.acrobatics !== pokemon.skills.acrobatics
            || this.skills.combat !== pokemon.skills.combat
            || this.skills.stealth !== pokemon.skills.stealth
            || this.skills.perception !== pokemon.skills.perception
            || this.skills.focus !== pokemon.skills.focus
        )
        {
            output.skills = pokemon.skills;
        }

        // Move List
        if (
            this.moveList.levelUp.length !== pokemon.moveList.levelUp.length
            || !this.moveList.levelUp.every(move =>
            {
                return pokemon.moveList.levelUp.some(({ level, move: name, type }) =>
                {
                    return move.level === level && move.move === name && move.type === type;
                });
            })
            || this.moveList.tmHm.length !== pokemon.moveList.tmHm.length
            || !this.moveList.tmHm.every(move => pokemon.moveList.tmHm.includes(move))
            || this.moveList.eggMoves.length !== pokemon.moveList.eggMoves.length
            || !this.moveList.eggMoves.every(move => pokemon.moveList.eggMoves.includes(move))
            || this.moveList.tutorMoves.length !== pokemon.moveList.tutorMoves.length
            || !this.moveList.tutorMoves.every(move => pokemon.moveList.tutorMoves.includes(move))
            || this.moveList.zygardeCubeMoves?.length !== pokemon.moveList.zygardeCubeMoves?.length
            || !(this.moveList.zygardeCubeMoves ?? []).every(move => (pokemon.moveList.zygardeCubeMoves ?? []).includes(move))
        )
        {
            output.moveList = pokemon.moveList;
        }

        // Mega Evolutions
        if (
            this.megaEvolutions?.some((megaEvolution) =>
            {
                return !pokemon.megaEvolutions?.some(({
                    name,
                    types,
                    ability,
                    abilityShift,
                    capabilities,
                    stats,
                }) =>
                {
                    return (
                        megaEvolution.name === name
                        && megaEvolution.types.every((type, index) => type === types[index])
                        && megaEvolution.ability === ability
                        && megaEvolution?.abilityShift === abilityShift
                        && (megaEvolution?.capabilities ?? []).every((capability, index) => capability === capabilities?.[index])
                        && megaEvolution.stats.hp === stats.hp
                        && megaEvolution.stats.attack === stats.attack
                        && megaEvolution.stats.defense === stats.defense
                        && megaEvolution.stats.specialAttack === stats.specialAttack
                        && megaEvolution.stats.specialDefense === stats.specialDefense
                        && megaEvolution.stats.speed === stats.speed
                    );
                });
            })
        )
        {
            output.megaEvolutions = pokemon.megaEvolutions;
        }

        // Metadata
        if (
            this.metadata.dexNumber !== pokemon.metadata.dexNumber
            || this.metadata.source !== pokemon.metadata.source
            || this.metadata.page !== pokemon.metadata.page
        )
        {
            output.metadata = pokemon.metadata;
        }

        // Extras
        if (
            !(this.extras ?? []).every((extra, index) =>
                extra.name === pokemon.extras?.[index]?.name
                || extra.value === pokemon.extras?.[index]?.value
            )
        )
        {
            output.extras = pokemon.extras;
        }

        return output;
    }
}
