export interface Pokemon {
    name: string;
    types: string[];
    baseStats: {
        hp: number;
        attack: number;
        defense: number;
        specialAttack: number;
        specialDefense: number;
        speed: number;
    };
    abilities: {
        basicAbilities: string[];
        advancedAbilities: string[];
        highAbility: string;
    };
    evolution: {
        name: string;
        level: number;
        stage: number;
    }[];
    sizeInformation: {
        height: {
            freedom: string;
            metric: string;
            ptu: string;
        };
        weight: {
            freedom: string;
            metric: string;
            ptu: number;
        };
    };
    breedingInformation: {
        genderRatio: {
            male?: number;
            female?: number;
            none?: boolean;
        };
        eggGroups: string[];
        averageHatchRate?: string;
    };
    diets: string[];
    habitats: string[];
    capabilities: {
        overland: number;
        swim?: number;
        sky?: number;
        levitate?: number;
        burrow?: number;
        highJump: number;
        lowJump: number;
        power: number;
        other?: string[];
    };
    skills: {
        athletics: string;
        acrobatics: string;
        combat: string;
        stealth: string;
        perception: string;
        focus: string;
    };
    moveList: {
        levelUp: {
            level: string | number;
            move: string;
            type: string;
        }[];
        tmHm: string[];
        eggMoves: string[];
        tutorMoves: string[];
        zygardeCubeMoves?: string[];
    };
    megaEvolutions?: {
        name: string;
        types: string[];
        ability: string;
        abilityShift?: string;      // For Necrozma's ultra burst
        capabilities?: string[];    // For Necrozma's ultra burst
        stats: {
            hp?: string;
            attack?: string;
            defense?: string;
            specialAttack?: string;
            specialDefense?: string;
            speed?: string;
        };
    }[];
    metadata: {
        dexNumber?: string;
        source: string;
        page?: string;
    };
    extras?: {                       // For anything extra that doesn't go anywhere else. Currently just for Oricorio's Forme Change.
        name: string;
        value: string;
    }[];
}
