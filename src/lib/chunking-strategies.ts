export interface ChunkingConfig {
  chunkSize: number;
  overlap: number;
  strategy: ChunkingStrategy;
}

export interface TextChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
  characterCount: number;
  overlap?: number;
  strategy: ChunkingStrategy;
}

export type ChunkingStrategy = 'fixed' | 'sentence' | 'paragraph' | 'recursive' | 'semantic';

export interface ChunkingResult {
  chunks: TextChunk[];
  totalChunks: number;
  averageChunkSize: number;
  processingTime: number;
  strategy: ChunkingStrategy;
}

export class ChunkingStrategies {
  static async chunkText(text: string, config: ChunkingConfig): Promise<ChunkingResult> {
    const startTime = performance.now();
    let chunks: TextChunk[] = [];

    switch (config.strategy) {
      case 'fixed':
        chunks = this.fixedSizeChunking(text, config);
        break;
      case 'sentence':
        chunks = this.sentenceBasedChunking(text, config);
        break;
      case 'paragraph':
        chunks = this.paragraphBasedChunking(text, config);
        break;
      case 'recursive':
        chunks = this.recursiveChunking(text, config);
        break;
      case 'semantic':
        chunks = this.semanticChunking(text, config);
        break;
      default:
        throw new Error(`Unknown chunking strategy: ${config.strategy}`);
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    const averageChunkSize = chunks.length > 0 
      ? chunks.reduce((sum, chunk) => sum + chunk.characterCount, 0) / chunks.length 
      : 0;

    return {
      chunks,
      totalChunks: chunks.length,
      averageChunkSize: Math.round(averageChunkSize),
      processingTime: Math.round(processingTime),
      strategy: config.strategy,
    };
  }

  private static fixedSizeChunking(text: string, config: ChunkingConfig): TextChunk[] {
    const chunks: TextChunk[] = [];
    let currentIndex = 0;
    let chunkId = 0;

    while (currentIndex < text.length) {
      const endIndex = Math.min(currentIndex + config.chunkSize, text.length);
      const content = text.slice(currentIndex, endIndex);
      
      chunks.push({
        id: `fixed-${chunkId++}`,
        content,
        startIndex: currentIndex,
        endIndex,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: content.length,
        overlap: chunkId > 1 ? config.overlap : 0,
        strategy: 'fixed',
      });

      currentIndex += config.chunkSize - config.overlap;
    }

    return chunks;
  }

  private static sentenceBasedChunking(text: string, config: ChunkingConfig): TextChunk[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: TextChunk[] = [];
    let currentChunk = '';
    let currentIndex = 0;
    let chunkId = 0;

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;
      
      if (potentialChunk.length > config.chunkSize && currentChunk) {
        // Save current chunk
        chunks.push({
          id: `sentence-${chunkId++}`,
          content: currentChunk,
          startIndex: currentIndex,
          endIndex: currentIndex + currentChunk.length,
          wordCount: currentChunk.split(/\s+/).filter(word => word.length > 0).length,
          characterCount: currentChunk.length,
          strategy: 'sentence',
        });

        currentIndex += currentChunk.length;
        currentChunk = trimmedSentence;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add remaining chunk
    if (currentChunk) {
      chunks.push({
        id: `sentence-${chunkId++}`,
        content: currentChunk,
        startIndex: currentIndex,
        endIndex: currentIndex + currentChunk.length,
        wordCount: currentChunk.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: currentChunk.length,
        strategy: 'sentence',
      });
    }

    return chunks;
  }

  private static paragraphBasedChunking(text: string, config: ChunkingConfig): TextChunk[] {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks: TextChunk[] = [];
    let currentChunk = '';
    let currentIndex = 0;
    let chunkId = 0;

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;

      const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + trimmedParagraph;
      
      if (potentialChunk.length > config.chunkSize && currentChunk) {
        // Save current chunk
        chunks.push({
          id: `paragraph-${chunkId++}`,
          content: currentChunk,
          startIndex: currentIndex,
          endIndex: currentIndex + currentChunk.length,
          wordCount: currentChunk.split(/\s+/).filter(word => word.length > 0).length,
          characterCount: currentChunk.length,
          strategy: 'paragraph',
        });

        currentIndex += currentChunk.length;
        currentChunk = trimmedParagraph;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add remaining chunk
    if (currentChunk) {
      chunks.push({
        id: `paragraph-${chunkId++}`,
        content: currentChunk,
        startIndex: currentIndex,
        endIndex: currentIndex + currentChunk.length,
        wordCount: currentChunk.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: currentChunk.length,
        strategy: 'paragraph',
      });
    }

    return chunks;
  }

  private static recursiveChunking(text: string, config: ChunkingConfig): TextChunk[] {
    const chunks: TextChunk[] = [];
    let chunkId = 0;

    const recursiveChunk = (text: string, startIndex: number): void => {
      if (text.length <= config.chunkSize) {
        chunks.push({
          id: `recursive-${chunkId++}`,
          content: text,
          startIndex,
          endIndex: startIndex + text.length,
          wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
          characterCount: text.length,
          strategy: 'recursive',
        });
        return;
      }

      // Try to split by paragraphs first
      const paragraphs = text.split(/\n\s*\n/);
      if (paragraphs.length > 1) {
        let currentIndex = startIndex;
        for (const paragraph of paragraphs) {
          if (paragraph.trim()) {
            recursiveChunk(paragraph.trim(), currentIndex);
            currentIndex += paragraph.length + 2; // Account for paragraph breaks
          }
        }
        return;
      }

      // Try to split by sentences
      const sentences = text.split(/[.!?]+/);
      if (sentences.length > 1) {
        let currentIndex = startIndex;
        let currentChunk = '';
        
        for (const sentence of sentences) {
          const trimmedSentence = sentence.trim();
          if (!trimmedSentence) continue;
          
          const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;
          
          if (potentialChunk.length > config.chunkSize && currentChunk) {
            recursiveChunk(currentChunk, currentIndex);
            currentIndex += currentChunk.length;
            currentChunk = trimmedSentence;
          } else {
            currentChunk = potentialChunk;
          }
        }
        
        if (currentChunk) {
          recursiveChunk(currentChunk, currentIndex);
        }
        return;
      }

      // Final fallback: split by words
      const words = text.split(/\s+/);
      let currentChunk = '';
      let currentIndex = startIndex;
      
      for (const word of words) {
        const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + word;
        
        if (potentialChunk.length > config.chunkSize && currentChunk) {
          chunks.push({
            id: `recursive-${chunkId++}`,
            content: currentChunk,
            startIndex: currentIndex,
            endIndex: currentIndex + currentChunk.length,
            wordCount: currentChunk.split(/\s+/).filter(w => w.length > 0).length,
            characterCount: currentChunk.length,
            strategy: 'recursive',
          });
          
          currentIndex += currentChunk.length + 1;
          currentChunk = word;
        } else {
          currentChunk = potentialChunk;
        }
      }
      
      if (currentChunk) {
        chunks.push({
          id: `recursive-${chunkId++}`,
          content: currentChunk,
          startIndex: currentIndex,
          endIndex: currentIndex + currentChunk.length,
          wordCount: currentChunk.split(/\s+/).filter(w => w.length > 0).length,
          characterCount: currentChunk.length,
          strategy: 'recursive',
        });
      }
    };

    recursiveChunk(text, 0);
    return chunks;
  }

  private static semanticChunking(text: string, config: ChunkingConfig): TextChunk[] {
    // Simple semantic chunking based on topic transitions
    // This is a heuristic approach using keyword density and sentence similarity
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: TextChunk[] = [];
    let currentChunk = '';
    let currentIndex = 0;
    let chunkId = 0;

    if (sentences.length === 0) return chunks;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + sentence;
      
      // Check if we should start a new chunk based on semantic similarity
      const shouldSplit = this.shouldSplitSemantically(
        currentChunk,
        sentence,
        potentialChunk.length,
        config.chunkSize
      );

      if (shouldSplit && currentChunk) {
        chunks.push({
          id: `semantic-${chunkId++}`,
          content: currentChunk,
          startIndex: currentIndex,
          endIndex: currentIndex + currentChunk.length,
          wordCount: currentChunk.split(/\s+/).filter(word => word.length > 0).length,
          characterCount: currentChunk.length,
          strategy: 'semantic',
        });

        currentIndex += currentChunk.length;
        currentChunk = sentence;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add remaining chunk
    if (currentChunk) {
      chunks.push({
        id: `semantic-${chunkId++}`,
        content: currentChunk,
        startIndex: currentIndex,
        endIndex: currentIndex + currentChunk.length,
        wordCount: currentChunk.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: currentChunk.length,
        strategy: 'semantic',
      });
    }

    return chunks;
  }

  private static shouldSplitSemantically(
    currentChunk: string,
    nextSentence: string,
    totalLength: number,
    maxSize: number
  ): boolean {
    // Size-based splitting
    if (totalLength > maxSize) return true;
    if (currentChunk.length < maxSize * 0.3) return false;

    // Simple heuristic: split if keyword overlap is low
    const currentWords = new Set(
      currentChunk.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .map(word => word.replace(/[^\w]/g, ''))
    );
    
    const nextWords = new Set(
      nextSentence.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .map(word => word.replace(/[^\w]/g, ''))
    );

    const intersection = new Set([...currentWords].filter(word => nextWords.has(word)));
    const union = new Set([...currentWords, ...nextWords]);
    
    const similarity = intersection.size / union.size;
    
    // Split if similarity is low and we're near the target size
    return similarity < 0.3 && totalLength > maxSize * 0.7;
  }
}