import 'dotenv/config';

// import { PokemonController } from './dal/PokemonController.js';
import { AiPdfReader } from './services/AiPdfReader.js';
import { Gen9PokemonParser } from './services/Gen9PokemonParser.js';

const pages = await AiPdfReader.read('pdfs/Gen 9 Homebrew - Pokemon Only.pdf');

console.log('\n page 1:', pages[0]);

await Gen9PokemonParser.parse(pages);
