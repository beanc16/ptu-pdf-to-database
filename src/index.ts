import 'dotenv/config';
import { PdfParsingController, PdfPath } from './controller/PdfParsingController.js';

// TODO: Update README with environment variable configuration instructions

await PdfParsingController.convertPdfToDatabase(PdfPath.PtuGen9Homebrew);
