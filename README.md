# 📄 PDF Chuncker - RAG Text Chunking Visualizer

🚀 **Interactive PDF chunking tool for RAG (Retrieval-Augmented Generation) systems**

Experiment with different text chunking strategies, upload PDFs, and visualize how your documents are split for optimal RAG performance!

## 🌟 Live Demo

**Try it now:** [https://pdf-chuncker.vercel.app/](https://pdf-chuncker.vercel.app/)

## 📚 Repository

**GitHub:** [https://github.com/lokeshpanthangi/pdf-chuncker.git](https://github.com/lokeshpanthangi/pdf-chuncker.git)

## ✨ Features

- 📤 **PDF Upload**: Drag & drop or click to upload PDF documents (up to 50MB)
- 🔧 **Multiple Chunking Strategies**: Choose from 4 different chunking methods
- 📊 **Real-time Visualization**: See your chunks as you configure them
- 📈 **Statistics Dashboard**: Analyze chunk distribution and characteristics
- 🎯 **Interactive Configuration**: Adjust parameters and see immediate results
- 💾 **Export Functionality**: Download your chunked results

## 🧩 What is Text Chunking?

Text chunking is the process of breaking down large documents into smaller, manageable pieces (chunks) for use in RAG systems. Proper chunking is crucial for:

- 🎯 **Better Retrieval**: Smaller chunks improve semantic search accuracy
- 💡 **Context Preservation**: Maintaining meaningful information boundaries
- ⚡ **Performance**: Optimizing embedding generation and storage
- 🧠 **LLM Compatibility**: Fitting within token limits of language models

## 🔄 Chunking Strategies

### 1. 📏 Fixed Size Chunking

**How it works:** Splits text into equal-sized chunks with optional overlap.

```
Text: "The quick brown fox jumps over the lazy dog. The dog was sleeping."
Chunk Size: 20 characters
Overlap: 5 characters

Chunk 1: "The quick brown fox "
Chunk 2: "fox jumps over the l"
Chunk 3: "the lazy dog. The do"
Chunk 4: "The dog was sleeping."
```

**✅ Advantages:**
- Predictable chunk sizes
- Simple implementation
- Memory efficient
- Consistent processing time

**⚠️ Considerations:**
- May break sentences/paragraphs
- Context boundaries ignored
- Potential loss of semantic meaning

**🎯 Best for:**
- Large documents with uniform structure
- When consistent chunk sizes are required
- Simple RAG implementations
- Memory-constrained environments

### 2. 📝 Sentence-Based Chunking

**How it works:** Preserves sentence boundaries while grouping sentences into chunks.

```
Text: "AI is transforming industries. Machine learning enables automation. Deep learning powers modern AI."

Chunk 1: "AI is transforming industries. Machine learning enables automation."
Chunk 2: "Deep learning powers modern AI."
```

**✅ Advantages:**
- Preserves sentence integrity
- Better readability
- Maintains grammatical structure
- Natural language flow

**⚠️ Considerations:**
- Variable chunk sizes
- May create very small or large chunks
- Depends on sentence length distribution

**🎯 Best for:**
- Question-answering systems
- Content that relies on complete thoughts
- Educational materials
- Legal documents

### 3. 📄 Paragraph-Based Chunking

**How it works:** Maintains topic coherence by keeping paragraphs intact.

```
Document with multiple paragraphs:

Chunk 1: [Complete Paragraph 1]
"Introduction to machine learning and its applications in modern technology..."

Chunk 2: [Complete Paragraph 2] 
"Deep learning architectures have revolutionized computer vision..."

Chunk 3: [Complete Paragraph 3]
"Natural language processing has seen significant advances..."
```

**✅ Advantages:**
- Preserves topic coherence
- Maintains logical structure
- Better context preservation
- Natural content boundaries

**⚠️ Considerations:**
- Highly variable chunk sizes
- Some paragraphs may be too long
- Depends on document structure

**🎯 Best for:**
- Research papers and articles
- Blog posts and news articles
- Technical documentation
- Content with clear topic separation

### 4. 🌳 Recursive Chunking

**How it works:** Intelligent hierarchical text splitting that tries multiple separators.

```
Process:
1. Try to split by paragraphs (\n\n)
2. If chunks too large, split by sentences (.!?)
3. If still too large, split by phrases (,;:)
4. Finally, split by words or characters

Example:
Large Paragraph → Sentences → Phrases → Words → Characters
```

**✅ Advantages:**
- Intelligent boundary detection
- Preserves context hierarchy
- Adapts to content structure
- Balances size and meaning

**⚠️ Considerations:**
- More complex implementation
- Longer processing time
- May still break semantic units

**🎯 Best for:**
- Mixed content types
- Complex document structures
- When you need balance between size and context
- Production RAG systems

## 🛠️ Technology Stack

- ⚛️ **React 18** - Modern UI framework
- 🔷 **TypeScript** - Type-safe development
- ⚡ **Vite** - Fast build tool and dev server
- 🎨 **Tailwind CSS** - Utility-first styling
- 🧩 **shadcn/ui** - Beautiful UI components
- 📄 **PDF.js** - PDF parsing and text extraction
- 🎯 **React Dropzone** - File upload handling

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lokeshpanthangi/pdf-chuncker.git
   cd pdf-chuncker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:8080
   ```

### Build for Production

```bash
npm run build
```

## 📖 How to Use

1. **📤 Upload PDF**: Drag and drop your PDF file or click to browse
2. **⚙️ Choose Strategy**: Select from Fixed Size, Sentence-Based, Paragraph-Based, or Recursive
3. **🔧 Configure Parameters**: Adjust chunk size, overlap, and other settings
4. **👀 Visualize**: See your chunks in real-time
5. **📊 Analyze**: Check statistics and chunk distribution
6. **💾 Export**: Download your chunked results

## 🎯 Use Cases

### 🤖 RAG Systems
- **Document Q&A**: Chunk knowledge bases for accurate retrieval
- **Chatbots**: Prepare training data with optimal chunk sizes
- **Search Systems**: Improve semantic search with proper chunking

### 📚 Content Processing
- **Research**: Analyze document structure and content distribution
- **Data Preparation**: Prepare text data for machine learning models
- **Content Analysis**: Understand document characteristics

### 🔬 Experimentation
- **Strategy Comparison**: Test different chunking approaches
- **Parameter Tuning**: Find optimal settings for your use case
- **Performance Testing**: Measure impact on retrieval quality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Lokesh Panthangi**
- GitHub: [@lokeshpanthangi](https://github.com/lokeshpanthangi)

## 🙏 Acknowledgments

- PDF.js team for excellent PDF parsing capabilities
- shadcn/ui for beautiful UI components
- Vercel for seamless deployment
- The RAG and LLM community for inspiration

---

⭐ **Star this repository if you find it helpful!**

🔗 **Live Demo:** [https://pdf-chuncker.vercel.app/](https://pdf-chuncker.vercel.app/)

📧 **Questions?** Open an issue or reach out!
