import 'dotenv/config';

import fs from 'node:fs';

// import { PokemonController } from './dal/PokemonController.js';
import { AiPdfReader } from './services/AiPdfReader.js';
import { Gen9PokemonParser, type Gen9PokemonParserResponse } from './services/Gen9PokemonParser.js';

const numOfPokemonPerBatch = parseInt(process.env.NUM_OF_POKEMON_PER_PATCH as string, 10);

const pages = await AiPdfReader.read('pdfs/Gen 9 Homebrew - Pokemon Only.pdf');

const results: Gen9PokemonParserResponse[] = [];

// TODO: Make this ask for human verification after each batch, to correct data, then save it to a second JSON file that acts as a staging array.
// for (let index = 0; index < pages.length; index += 1)
for (let index = 0; index < numOfPokemonPerBatch; index += 1)
{
    const page = pages[index];

    if (process.env.SHOW_DEBUG_LOGS === 'true')
    {
        console.log(`\nPage ${index + 1}:`, page);
    }

    // TODO: Track the time it takes to parse each page, and give a progress update on the estimated time remaining per batch and number of remaining batches.
    const result = await Gen9PokemonParser.parse(page);
    results.push(result);

    // Save to JSON
    if (process.env.SAVE_TO_JSON_FILE === 'true')
    {
        fs.writeFileSync('./json/current-batch.json', JSON.stringify(results, null, 2));
    }
}

// TODO: Update README with environment variable instructions once this is done.
