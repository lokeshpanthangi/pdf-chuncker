export const SAMPLE_TEXT = `
# Introduction to Retrieval-Augmented Generation (RAG)

Retrieval-Augmented Generation (RAG) is a powerful approach that combines the strengths of pre-trained language models with external knowledge retrieval systems. This methodology has revolutionized how we approach question-answering systems, document summarization, and knowledge-intensive tasks.

## What is RAG?

RAG systems work by first retrieving relevant information from a knowledge base or document collection, then using this retrieved information to generate more accurate and contextually relevant responses. The process typically involves two main steps: retrieval and generation.

### The Retrieval Phase

During the retrieval phase, the system searches through a large corpus of documents to find the most relevant pieces of information related to the user's query. This is typically done using vector similarity search, where documents are encoded into high-dimensional vectors, and the most similar vectors to the query are retrieved.

### The Generation Phase

In the generation phase, the retrieved information is combined with the original query and fed into a language model. The language model then generates a response that incorporates both its pre-trained knowledge and the retrieved information, resulting in more accurate and up-to-date responses.

## Text Chunking in RAG Systems

One of the most critical aspects of building effective RAG systems is how you chunk or split your text documents. The chunking strategy directly impacts the quality of retrieval and, consequently, the quality of the generated responses.

### Why Chunking Matters

Text chunking is essential for several reasons:

1. **Computational Efficiency**: Large documents need to be broken down into smaller, manageable pieces that can be processed efficiently by embedding models.

2. **Retrieval Precision**: Smaller chunks often contain more focused information, making it easier to match relevant content to user queries.

3. **Context Window Limitations**: Language models have limited context windows, so chunks must be sized appropriately to fit within these constraints.

4. **Semantic Coherence**: Good chunking preserves the semantic relationships within the text while ensuring each chunk contains meaningful, self-contained information.

## Different Chunking Strategies

### Fixed-Size Chunking

Fixed-size chunking divides text into equal-sized segments based on character count or token count. This approach is simple and predictable but may break sentences or paragraphs in the middle, potentially losing semantic meaning.

**Advantages:**
- Predictable chunk sizes
- Simple to implement
- Memory efficient
- Consistent processing times

**Disadvantages:**
- May break sentences or paragraphs
- Ignores natural language boundaries
- Can split related concepts

### Sentence-Based Chunking

Sentence-based chunking respects sentence boundaries and combines sentences until reaching a target size. This approach maintains grammatical integrity but may result in variable chunk sizes.

**Advantages:**
- Preserves sentence integrity
- Natural language boundaries
- Better readability
- Maintains grammatical structure

**Disadvantages:**
- Variable chunk sizes
- Dependent on sentence detection accuracy
- May not respect paragraph boundaries

### Paragraph-Based Chunking

Paragraph-based chunking uses paragraph breaks as natural splitting points. This method is excellent for structured documents but can create very large or very small chunks depending on the document structure.

**Advantages:**
- Preserves topic coherence
- Natural content boundaries
- Good for structured documents
- Maintains author's intended structure

**Disadvantages:**
- Highly variable chunk sizes
- May create chunks that are too large
- Dependent on document formatting

### Recursive Chunking

Recursive chunking implements a hierarchical approach, first trying to split by paragraphs, then by sentences, and finally by words if necessary. This method provides intelligent splitting while maintaining semantic coherence.

**Advantages:**
- Intelligent boundary detection
- Preserves context hierarchy
- Flexible and adaptive
- Maintains semantic relationships

**Disadvantages:**
- More complex to implement
- Potentially slower processing
- May require fine-tuning for different document types

### Semantic Chunking

Semantic chunking attempts to group text based on topic similarity and semantic relationships. This approach uses natural language processing techniques to identify topic transitions and create chunks that maintain thematic coherence.

**Advantages:**
- Topic coherence
- Semantic relationship preservation
- Context-aware splitting
- Better for complex documents

**Disadvantages:**
- Computationally expensive
- May miss subtle topic changes
- Language and domain dependent
- Requires sophisticated NLP models

## Best Practices for RAG Chunking

When implementing chunking strategies for RAG systems, consider these best practices:

### 1. Understand Your Data

Different types of documents require different chunking approaches. Technical manuals might benefit from paragraph-based chunking, while narrative text might work better with sentence-based approaches.

### 2. Consider Your Use Case

The intended application affects chunking strategy. Question-answering systems might prefer smaller, focused chunks, while summarization tasks might benefit from larger, more comprehensive chunks.

### 3. Test Multiple Strategies

Don't rely on a single chunking approach. Test different strategies with your specific data and use cases to determine what works best for your application.

### 4. Monitor Performance

Continuously monitor the performance of your RAG system and be prepared to adjust your chunking strategy based on real-world usage patterns and feedback.

### 5. Balance Chunk Size and Overlap

When using overlap between chunks, balance the benefits of maintaining context with the increased computational cost and potential redundancy.

## Conclusion

Effective text chunking is crucial for building high-performance RAG systems. The choice of chunking strategy depends on your specific use case, document types, and performance requirements. By understanding the trade-offs between different approaches and following best practices, you can optimize your RAG system for better retrieval accuracy and response quality.

Remember that chunking is not a one-size-fits-all solution. The best approach often involves experimenting with different strategies and fine-tuning based on your specific requirements and data characteristics.
`;

export const createSamplePDFData = () => ({
  text: SAMPLE_TEXT.trim(),
  pages: 1,
  title: "Introduction to RAG Chunking Strategies",
  author: "RAG Chunking Visualizer",
  subject: "Text Chunking for Retrieval-Augmented Generation"
});