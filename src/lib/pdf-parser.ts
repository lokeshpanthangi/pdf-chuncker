
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js to use a local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

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
      console.log('Starting PDF parsing for file:', file.name, 'Size:', file.size);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0, // Reduce logging noise
        maxImageSize: 1024 * 1024 * 10, // 10MB max image size
        disableFontFace: true, // Improve performance
        disableAutoFetch: false,
        disableStream: false
      });
      
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      let fullText = '';
      const pages = pdf.numPages;
      
      // Process pages in batches to handle large files better
      const batchSize = 5;
      for (let startPage = 1; startPage <= pages; startPage += batchSize) {
        const endPage = Math.min(startPage + batchSize - 1, pages);
        console.log(`Processing pages ${startPage}-${endPage}`);
        
        const pagePromises = [];
        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
          pagePromises.push(this.extractPageText(pdf, pageNum));
        }
        
        const pageTexts = await Promise.all(pagePromises);
        fullText += pageTexts.join('\n\n') + '\n\n';
        
        // Add a small delay to prevent blocking the UI for very large files
        if (endPage < pages) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      // Get metadata
      const metadata = await pdf.getMetadata();
      const info = metadata.info as any;
      
      console.log('PDF parsing completed. Text length:', fullText.length);
      
      return {
        text: fullText.trim(),
        pages,
        title: info?.Title || undefined,
        author: info?.Author || undefined,
        subject: info?.Subject || undefined,
      };
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private static async extractPageText(pdf: any, pageNum: number): Promise<string> {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .filter((item): item is any => 'str' in item)
        .map((item) => item.str)
        .join(' ');
      
      return pageText;
    } catch (error) {
      console.error(`Error extracting text from page ${pageNum}:`, error);
      return `[Error extracting page ${pageNum}]`;
    }
  }
}
