import { MongoDbController } from 'mongodb-controller';
import { PokemonCollection } from './PokemonCollection.js';

export class PokemonController extends MongoDbController
{
    static collectionName = process.env.COLLECTION_POKEMON as string;
    static Model = PokemonCollection;
}
