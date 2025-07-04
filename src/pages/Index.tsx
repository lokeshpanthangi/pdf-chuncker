import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PDFUpload } from '@/components/pdf-upload';
import { StrategySelector } from '@/components/strategy-selector';
import { ChunkVisualizer } from '@/components/chunk-visualizer';
import { StatisticsDashboard } from '@/components/statistics-dashboard';
import { PDFParser, PDFParseResult } from '@/lib/pdf-parser';
import { ChunkingStrategies, ChunkingConfig, ChunkingResult, ChunkingStrategy } from '@/lib/chunking-strategies';
import { useToast } from '@/hooks/use-toast';
import { FileText, Zap, BarChart3, Eye, Settings, Download } from 'lucide-react';

const Index = () => {
  const [pdfData, setPdfData] = useState<PDFParseResult | null>(null);
  const [chunkingConfig, setChunkingConfig] = useState<ChunkingConfig>({
    strategy: 'fixed' as ChunkingStrategy,
    chunkSize: 1000,
    overlap: 100
  });
  const [chunkingResult, setChunkingResult] = useState<ChunkingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChunking, setIsChunking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await PDFParser.parseFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setPdfData(result);
      setActiveTab('strategy');
      
      toast({
        title: "PDF processed successfully",
        description: `Extracted ${result.text.length.toLocaleString()} characters from ${result.pages} pages`,
      });
      
      // Auto-chunk with default strategy
      await performChunking(result.text, chunkingConfig);
      
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, [chunkingConfig, toast]);

  const performChunking = useCallback(async (text: string, config: ChunkingConfig) => {
    setIsChunking(true);
    
    try {
      const result = await ChunkingStrategies.chunkText(text, config);
      setChunkingResult(result);
      
      toast({
        title: "Chunking completed",
        description: `Generated ${result.totalChunks} chunks using ${config.strategy} strategy`,
      });
    } catch (error) {
      toast({
        title: "Chunking failed",
        description: error instanceof Error ? error.message : "Failed to chunk text",
        variant: "destructive",
      });
    } finally {
      setIsChunking(false);
    }
  }, [toast]);

  const handleConfigChange = useCallback((newConfig: ChunkingConfig) => {
    setChunkingConfig(newConfig);
    
    // Re-chunk if we have PDF data
    if (pdfData) {
      performChunking(pdfData.text, newConfig);
    }
  }, [pdfData, performChunking]);

  const exportChunks = useCallback(() => {
    if (!chunkingResult) return;
    
    const exportData = {
      metadata: {
        strategy: chunkingResult.strategy,
        totalChunks: chunkingResult.totalChunks,
        averageChunkSize: chunkingResult.averageChunkSize,
        processingTime: chunkingResult.processingTime,
        exportedAt: new Date().toISOString()
      },
      chunks: chunkingResult.chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        characterCount: chunk.characterCount,
        wordCount: chunk.wordCount,
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
        strategy: chunk.strategy
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rag-chunks-${chunkingResult.strategy}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Chunks have been exported as JSON file",
    });
  }, [chunkingResult, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                RAG Chunking Strategy Visualizer
              </h1>
              <p className="text-muted-foreground mt-2">
                Experiment with different text chunking strategies for RAG systems
              </p>
            </div>
            
            {chunkingResult && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-success/20 text-success">
                  {chunkingResult.totalChunks} chunks generated
                </Badge>
                <Button onClick={exportChunks} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* PDF Info Card */}
            {pdfData && (
              <Card className="bg-gradient-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages:</span>
                    <span className="font-medium">{pdfData.pages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Characters:</span>
                    <span className="font-medium">{pdfData.text.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Words:</span>
                    <span className="font-medium">
                      {pdfData.text.split(/\s+/).filter(w => w.length > 0).length.toLocaleString()}
                    </span>
                  </div>
                  {pdfData.title && (
                    <>
                      <Separator className="my-2" />
                      <div>
                        <span className="text-muted-foreground text-xs">Title:</span>
                        <p className="font-medium text-xs mt-1">{pdfData.title}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Strategy Configuration */}
            <StrategySelector 
              config={chunkingConfig}
              onConfigChange={handleConfigChange}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="strategy" className="flex items-center gap-2" disabled={!pdfData}>
                  <Settings className="w-4 h-4" />
                  Strategy
                </TabsTrigger>
                <TabsTrigger value="chunks" className="flex items-center gap-2" disabled={!chunkingResult}>
                  <Eye className="w-4 h-4" />
                  Chunks
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2" disabled={!chunkingResult}>
                  <BarChart3 className="w-4 h-4" />
                  Statistics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                <PDFUpload
                  onFileUpload={handleFileUpload}
                  isProcessing={isProcessing}
                  uploadProgress={uploadProgress}
                />
                
                {!pdfData && (
                  <Card className="bg-gradient-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Getting Started
                      </CardTitle>
                      <CardDescription>
                        Learn about different chunking strategies for RAG systems
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <h4 className="font-medium text-viz-blue">Fixed Size</h4>
                          <p className="text-muted-foreground">Equal-sized chunks with optional overlap</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-viz-purple">Sentence-Based</h4>
                          <p className="text-muted-foreground">Preserves sentence boundaries for readability</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-viz-green">Paragraph-Based</h4>
                          <p className="text-muted-foreground">Maintains topic coherence using paragraphs</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-viz-orange">Recursive</h4>
                          <p className="text-muted-foreground">Intelligent hierarchical text splitting</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="strategy" className="space-y-6">
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle>Strategy Configuration</CardTitle>
                    <CardDescription>
                      Adjust parameters and see how they affect chunking results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isChunking ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-3">
                          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                          <p className="text-sm text-muted-foreground">Processing chunks...</p>
                        </div>
                      </div>
                    ) : chunkingResult ? (
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-success">
                          <Zap className="w-5 h-5" />
                          <span className="font-medium">Chunking Complete</span>
                        </div>
                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                          <span>{chunkingResult.totalChunks} chunks</span>
                          <span>{chunkingResult.averageChunkSize} avg size</span>
                          <span>{chunkingResult.processingTime}ms</span>
                        </div>
                        <Button onClick={() => setActiveTab('chunks')} className="mt-4">
                          View Chunks
                        </Button>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Upload a PDF to start experimenting with chunking strategies
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chunks">
                <ChunkVisualizer 
                  chunks={chunkingResult?.chunks || []}
                  isLoading={isChunking}
                />
              </TabsContent>

              <TabsContent value="stats">
                <StatisticsDashboard 
                  result={chunkingResult}
                  originalTextLength={pdfData?.text.length}
                  isLoading={isChunking}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;