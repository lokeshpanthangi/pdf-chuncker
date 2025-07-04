
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
    console.log(`Starting ${config.strategy} chunking for text of length:`, text.length);
    const startTime = performance.now();
    let chunks: TextChunk[] = [];

    // Handle empty or very small text
    if (!text || text.trim().length === 0) {
      console.warn('Empty text provided for chunking');
      return {
        chunks: [],
        totalChunks: 0,  
        averageChunkSize: 0,
        processingTime: 0,
        strategy: config.strategy,
      };
    }

    try {
      switch (config.strategy) {
        case 'fixed':
          chunks = await this.fixedSizeChunking(text, config);
          break;
        case 'sentence':
          chunks = await this.sentenceBasedChunking(text, config);
          break;
        case 'paragraph':
          chunks = await this.paragraphBasedChunking(text, config);
          break;
        case 'recursive':
          chunks = await this.recursiveChunking(text, config);
          break;
        case 'semantic':
          chunks = await this.semanticChunking(text, config);
          break;
        default:
          throw new Error(`Unknown chunking strategy: ${config.strategy}`);
      }
    } catch (error) {
      console.error('Chunking failed:', error);
      throw new Error(`Chunking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    const averageChunkSize = chunks.length > 0 
      ? chunks.reduce((sum, chunk) => sum + chunk.characterCount, 0) / chunks.length 
      : 0;

    console.log(`Chunking completed: ${chunks.length} chunks, avg size: ${Math.round(averageChunkSize)}, time: ${Math.round(processingTime)}ms`);

    return {
      chunks,
      totalChunks: chunks.length,
      averageChunkSize: Math.round(averageChunkSize),
      processingTime: Math.round(processingTime),
      strategy: config.strategy,
    };
  }

  // Process large texts in batches to prevent UI blocking
  private static async processInBatches<T>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<any[]> | any[]
  ): Promise<any[]> {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      // Yield control to prevent blocking
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    return results;
  }

  private static async fixedSizeChunking(text: string, config: ChunkingConfig): Promise<TextChunk[]> {
    const chunks: TextChunk[] = [];
    let currentIndex = 0;
    let chunkId = 0;

    while (currentIndex < text.length) {
      const endIndex = Math.min(currentIndex + config.chunkSize, text.length);
      const content = text.slice(currentIndex, endIndex);
      
      if (content.trim().length === 0) {
        currentIndex = endIndex;
        continue;
      }
      
      chunks.push({
        id: `fixed-${chunkId++}`,
        content: content.trim(),
        startIndex: currentIndex,
        endIndex,
        wordCount: this.countWords(content),
        characterCount: content.length,
        overlap: chunkId > 1 ? Math.min(config.overlap, content.length) : 0,
        strategy: 'fixed',
      });

      currentIndex += config.chunkSize - config.overlap;
      
      // Prevent infinite loop
      if (currentIndex >= text.length) break;
    }

    return chunks;
  }

  private static async sentenceBasedChunking(text: string, config: ChunkingConfig): Promise<TextChunk[]> {
    // Improved sentence splitting regex
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const chunks: TextChunk[] = [];
    let currentChunk = '';
    let currentIndex = 0;
    let chunkId = 0;

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + trimmedSentence;
      
      if (potentialChunk.length > config.chunkSize && currentChunk) {
        // Save current chunk
        chunks.push({
          id: `sentence-${chunkId++}`,
          content: currentChunk.trim(),
          startIndex: currentIndex,
          endIndex: currentIndex + currentChunk.length,
          wordCount: this.countWords(currentChunk),
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
    if (currentChunk.trim()) {
      chunks.push({
        id: `sentence-${chunkId++}`,
        content: currentChunk.trim(),
        startIndex: currentIndex,
        endIndex: currentIndex + currentChunk.length,
        wordCount: this.countWords(currentChunk),
        characterCount: currentChunk.length,
        strategy: 'sentence',
      });
    }

    return chunks;
  }

  private static async paragraphBasedChunking(text: string, config: ChunkingConfig): Promise<TextChunk[]> {
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
          content: currentChunk.trim(),
          startIndex: currentIndex,
          endIndex: currentIndex + currentChunk.length,
          wordCount: this.countWords(currentChunk),
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
    if (currentChunk.trim()) {
      chunks.push({
        id: `paragraph-${chunkId++}`,
        content: currentChunk.trim(),
        startIndex: currentIndex,
        endIndex: currentIndex + currentChunk.length,
        wordCount: this.countWords(currentChunk),
        characterCount: currentChunk.length,
        strategy: 'paragraph',
      });
    }

    return chunks;
  }

  private static async recursiveChunking(text: string, config: ChunkingConfig): Promise<TextChunk[]> {
    const chunks: TextChunk[] = [];
    let chunkId = 0;

    const recursiveChunk = async (text: string, startIndex: number): Promise<void> => {
      if (text.trim().length === 0) return;
      
      if (text.length <= config.chunkSize) {
        chunks.push({
          id: `recursive-${chunkId++}`,
          content: text.trim(),
          startIndex,
          endIndex: startIndex + text.length,
          wordCount: this.countWords(text),
          characterCount: text.length,
          strategy: 'recursive',
        });
        return;
      }

      // Try to split by paragraphs first
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      if (paragraphs.length > 1) {
        let currentIndex = startIndex;
        for (const paragraph of paragraphs) {
          if (paragraph.trim()) {
            await recursiveChunk(paragraph.trim(), currentIndex);
            currentIndex += paragraph.length + 2; // Account for paragraph breaks
          }
        }
        return;
      }

      // Try to split by sentences
      const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
      if (sentences.length > 1) {
        let currentIndex = startIndex;
        let currentChunk = '';
        
        for (const sentence of sentences) {
          const trimmedSentence = sentence.trim();
          if (!trimmedSentence) continue;
          
          const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + trimmedSentence;
          
          if (potentialChunk.length > config.chunkSize && currentChunk) {
            await recursiveChunk(currentChunk, currentIndex);
            currentIndex += currentChunk.length;
            currentChunk = trimmedSentence;
          } else {
            currentChunk = potentialChunk;
          }
        }
        
        if (currentChunk.trim()) {
          await recursiveChunk(currentChunk, currentIndex);
        }
        return;
      }

      // Final fallback: split by words
      const words = text.split(/\s+/).filter(w => w.trim().length > 0);
      let currentChunk = '';
      let currentIndex = startIndex;
      
      for (const word of words) {
        const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + word;
        
        if (potentialChunk.length > config.chunkSize && currentChunk) {
          chunks.push({
            id: `recursive-${chunkId++}`,
            content: currentChunk.trim(),
            startIndex: currentIndex,
            endIndex: currentIndex + currentChunk.length,
            wordCount: this.countWords(currentChunk),
            characterCount: currentChunk.length,
            strategy: 'recursive',
          });
          
          currentIndex += currentChunk.length + 1;
          currentChunk = word;
        } else {
          currentChunk = potentialChunk;
        }
      }
      
      if (currentChunk.trim()) {
        chunks.push({
          id: `recursive-${chunkId++}`,
          content: currentChunk.trim(),
          startIndex: currentIndex,
          endIndex: currentIndex + currentChunk.length,
          wordCount: this.countWords(currentChunk),
          characterCount: currentChunk.length,
          strategy: 'recursive',
        });
      }
    };

    await recursiveChunk(text, 0);
    return chunks;
  }

  private static async semanticChunking(text: string, config: ChunkingConfig): Promise<TextChunk[]> {
    // Enhanced semantic chunking with better topic detection
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const chunks: TextChunk[] = [];
    let currentChunk = '';
    let currentIndex = 0;
    let chunkId = 0;

    if (sentences.length === 0) return chunks;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
      
      // Check if we should start a new chunk based on semantic similarity
      const shouldSplit = await this.shouldSplitSemantically(
        currentChunk,
        sentence,
        potentialChunk.length,
        config.chunkSize,
        i < sentences.length - 1 ? sentences[i + 1] : ''
      );

      if (shouldSplit && currentChunk.trim()) {
        chunks.push({
          id: `semantic-${chunkId++}`,
          content: currentChunk.trim(),
          startIndex: currentIndex,
          endIndex: currentIndex + currentChunk.length,
          wordCount: this.countWords(currentChunk),
          characterCount: currentChunk.length,
          strategy: 'semantic',
        });

        currentIndex += currentChunk.length;
        currentChunk = sentence;
      } else {
        currentChunk = potentialChunk;
      }
      
      // Yield control for large texts
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    // Add remaining chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `semantic-${chunkId++}`,
        content: currentChunk.trim(),
        startIndex: currentIndex,
        endIndex: currentIndex + currentChunk.length,
        wordCount: this.countWords(currentChunk),
        characterCount: currentChunk.length,
        strategy: 'semantic',
      });
    }

    return chunks;
  }

  private static async shouldSplitSemantically(
    currentChunk: string,
    nextSentence: string,
    totalLength: number,
    maxSize: number,
    followingSentence: string = ''
  ): Promise<boolean> {
    // Size-based splitting
    if (totalLength > maxSize) return true;
    if (currentChunk.length < maxSize * 0.3) return false;

    // Enhanced semantic analysis
    const currentWords = this.extractKeywords(currentChunk);
    const nextWords = this.extractKeywords(nextSentence);
    const followingWords = followingSentence ? this.extractKeywords(followingSentence) : new Set();

    // Calculate semantic similarity
    const similarity = this.calculateSimilarity(currentWords, nextWords);
    const contextualSimilarity = followingSentence 
      ? this.calculateSimilarity(nextWords, followingWords) 
      : 0;

    // Topic transition detection
    const hasTopicTransition = this.detectTopicTransition(currentChunk, nextSentence);
    
    // Split if similarity is low and we're near the target size, or if there's a clear topic transition
    return (similarity < 0.2 && totalLength > maxSize * 0.6) || 
           (hasTopicTransition && totalLength > maxSize * 0.4) ||
           (contextualSimilarity > similarity * 1.5 && totalLength > maxSize * 0.5);
  }

  private static extractKeywords(text: string): Set<string> {
    // Extract meaningful words (excluding common stop words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they']);
    
    return new Set(
      text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word))
        .slice(0, 20) // Limit to top 20 keywords for performance
    );
  }

  private static calculateSimilarity(set1: Set<string>, set2: Set<string>): number {
    if (set1.size === 0 || set2.size === 0) return 0;
    
    const intersection = new Set([...set1].filter(word => set2.has(word)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private static detectTopicTransition(currentText: string, nextSentence: string): boolean {
    // Simple heuristics for topic transitions
    const transitionIndicators = [
      /^(however|moreover|furthermore|additionally|meanwhile|subsequently|consequently|therefore|thus|hence)/i,
      /^(in contrast|on the other hand|alternatively|conversely)/i,
      /^(first|second|third|finally|lastly|in conclusion)/i,
      /^(chapter|section|\d+\.)/i
    ];
    
    return transitionIndicators.some(pattern => pattern.test(nextSentence.trim()));
  }

  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}
