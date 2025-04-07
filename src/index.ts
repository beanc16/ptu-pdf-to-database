import 'dotenv/config';
import { PdfParsingController, PdfPath } from './controller/PdfParsingController.js';

await PdfParsingController.convertPdfToDatabase(PdfPath.PtuGen9Homebrew);
