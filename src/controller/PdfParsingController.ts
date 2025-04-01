import fs from 'node:fs';

import { AiPdfReader } from '../services/AiPdfReader.js';
import { Gen9PokemonParser, type Gen9PokemonParserResponse } from '../services/Gen9PokemonParser.js';
import { PerformanceMetricTracker } from '../services/PerformanceMetricTracker.js';
import { Pokemon } from '../dal/types/Responses.js';

export enum PdfPath
{
    PtuGen9Homebrew = 'pdfs/Gen 9 Homebrew - Pokemon Only.pdf',
}

interface PdfParserResponseMap
{
    [PdfPath.PtuGen9Homebrew]: Gen9PokemonParserResponse;
};

export class PdfParsingController
{
    private static createJsonOutputDirectory(): void
    {
        // Create JSON output directory if it does not yet exist
        if (process.env.SAVE_TO_JSON_FILE === 'true' && !fs.existsSync('./json'))
        {
            fs.mkdirSync('./json');
        }
    }

    private static async parsePdf<Path extends PdfPath>(pdfPath: Path, page: string): Promise<PdfParserResponseMap[Path]>
    {
        const resultMap: Record<PdfPath, () => Promise<PdfParserResponseMap[Path]>> = {
            [PdfPath.PtuGen9Homebrew]: async () => await Gen9PokemonParser.parse(page),
        };

        return await resultMap[pdfPath]();
    }

    private static async translateDataForDal<Path extends PdfPath>(pdfPath: Path, data: PdfParserResponseMap[Path][]): Promise<Pokemon[]>
    {
        const resultMap: Record<PdfPath, () => Promise<Pokemon[]>> = {
            [PdfPath.PtuGen9Homebrew]: async () => await Gen9PokemonParser.translate(data),
        };

        return await resultMap[pdfPath]();
    }

    private static getDataFromJsonFile<Path extends PdfPath>(_pdfPath: Path): PdfParserResponseMap[Path][]
    {
        // Throw error if JSON file does not exist
        if (!fs.existsSync('./json/current-batch.json'))
        {
            throw new Error('JSON file does not exist');
        }

        // Get data from JSON file
        const file = fs.readFileSync('json/current-batch.json', 'utf8');
        const data = JSON.parse(file) as PdfParserResponseMap[Path][];

        return data;
    }

    private static saveToJsonFile<Element>(data: Element[]): void
    {
        if (process.env.SAVE_TO_JSON_FILE === 'true' && fs.existsSync('./json'))
        {
            fs.writeFileSync('./json/current-batch.json', JSON.stringify(data, null, 2));
        }
    }

    private static logProcessingInformation({
        index,
        startingIndex,
        endingIndex,
        numOfPagesProcessed,
    }: {
        index: number;
        startingIndex: number;
        endingIndex: number;
        numOfPagesProcessed: number;
    }): void
    {
        if (process.env.SHOW_PROCESSING_LOGS !== 'true')
        {
            return;
        }

        const { averageDurationInSeconds, averageDurationInMinutes } = PerformanceMetricTracker;
        console.log('\nParsing...');

        // Log estimated time remaining for each batch after the first
        if (index > startingIndex)
        {
            const currentPage = index - startingIndex;
            const totalPages = endingIndex - startingIndex;
            const remainingPages = totalPages - numOfPagesProcessed;
            const remainingSeconds = (averageDurationInSeconds * remainingPages).toFixed(1);
            const remainingMinutes = (averageDurationInMinutes * remainingPages).toFixed(1);

            console.log([
                `Pages Processed: ${currentPage}/${totalPages} (${remainingPages} pages remaining)`,
                `Estimated Page Processing Time: ${averageDurationInSeconds.toFixed(1)}secs`,
                `Estimated Remaining Total Processing Time: ${remainingMinutes}mins | ${remainingSeconds}secs`,
            ].join('\n'));
        }
    }

    private static logPostProcessingInformation({
        startingIndex,
        endingIndex,
    }: {
        startingIndex: number;
        endingIndex: number;
    }): void
    {
        if (process.env.SHOW_PROCESSING_LOGS === 'true')
        {
            const pagesProcessed = endingIndex - startingIndex;
            console.log(`\nPages Processed: ${pagesProcessed}/${pagesProcessed} (0 pages remaining)`);
        }
    }

    private static async convertPdfToJson(pdfPath: PdfPath): Promise<void>
    {
        // Return early if not saving to JSON
        if (process.env.SAVE_TO_JSON_FILE !== 'true')
        {
            return;
        }

        // Create JSON output directory
        this.createJsonOutputDirectory();

        // Read the pages of the PDF
        const pages = await AiPdfReader.read(pdfPath);

        // Initialize control variables
        const results: Gen9PokemonParserResponse[] = [];
        const startingIndex = parseInt(process.env.START_AT_PAGE_INDEX || '0', 10);
        const endingIndex = parseInt(process.env.END_AT_PAGE_INDEX || `${pages.length}`, 10);
        let numOfPagesProcessed = 0;

        // Loop through the pages
        for (let index = startingIndex; index < endingIndex; index += 1)
        {
            // Log processing information to the console
            this.logProcessingInformation({
                index,
                startingIndex,
                endingIndex,
                numOfPagesProcessed,
            });

            // Parse PDF & track performance of parsing
            PerformanceMetricTracker.start(index);

            const result = await this.parsePdf(pdfPath, pages[index]);
            results.push(result);

            PerformanceMetricTracker.end(index);

            // Save to JSON file
            this.saveToJsonFile(results);

            numOfPagesProcessed += 1;
        }

        // Log post-processing information to the console
        this.logPostProcessingInformation({ startingIndex, endingIndex });
    }

    private static async saveJsonToDatabase<Path extends PdfPath>(pdfPath: Path): Promise<void>
    {
        if (process.env.SAVE_TO_DATABASE !== 'true')
        {
            return;
        }

        // TODO: Prompt for human verification of data before saving to database

        // Get data from JSON file
        const data = this.getDataFromJsonFile(pdfPath);

        // Translate data
        const translatedData = await this.translateDataForDal(pdfPath, data);

        // Save data to database
        // TODO
        console.log('\n translatedData:', translatedData);
    }

    public static async convertPdfToDatabase(pdfPath: PdfPath): Promise<void>
    {
        await this.convertPdfToJson(pdfPath);
        await this.saveJsonToDatabase(pdfPath);
    }
}
