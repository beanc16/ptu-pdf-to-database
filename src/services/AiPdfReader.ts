import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export class AiPdfReader
{
    public static async read(path: string): Promise<string[]>
    {
        const loader = new PDFLoader(path);
        const docs = await loader.load();
        return docs.map(({ pageContent }) => pageContent);
    }
}
