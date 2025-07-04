import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFParseResult {
  text: string;
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
}

export class PDFParser {
  static async parseFile(file: File): Promise<PDFParseResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const pages = pdf.numPages;
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .filter((item): item is any => 'str' in item)
          .map((item) => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      // Get metadata
      const metadata = await pdf.getMetadata();
      const info = metadata.info as any;
      
      return {
        text: fullText.trim(),
        pages,
        title: info?.Title || undefined,
        author: info?.Author || undefined,
        subject: info?.Subject || undefined,
      };
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file. Please ensure it\'s a valid PDF document.');
    }
  }
}