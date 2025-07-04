import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, Copy, Eye } from 'lucide-react';
import { TextChunk } from '@/lib/chunking-strategies';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ChunkVisualizerProps {
  chunks: TextChunk[];
  isLoading?: boolean;
}

const STRATEGY_COLORS = {
  fixed: 'chunk-fixed',
  sentence: 'chunk-sentence',
  paragraph: 'chunk-paragraph',
  recursive: 'chunk-recursive',
  semantic: 'chunk-semantic'
};

export function ChunkVisualizer({ chunks, isLoading = false }: ChunkVisualizerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());
  const [selectedChunk, setSelectedChunk] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredChunks = chunks.filter(chunk =>
    chunk.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleChunkExpansion = (chunkId: string) => {
    const newExpanded = new Set(expandedChunks);
    if (newExpanded.has(chunkId)) {
      newExpanded.delete(chunkId);
    } else {
      newExpanded.add(chunkId);
    }
    setExpandedChunks(newExpanded);
  };

  const copyChunkContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Chunk content has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400/30 text-foreground rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Chunk Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Chunk Visualization
            <Badge variant="secondary">
              {filteredChunks.length} {filteredChunks.length === 1 ? 'chunk' : 'chunks'}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search chunks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {chunks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No chunks to display</p>
            <p className="text-sm">Upload a PDF and select a chunking strategy to get started</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredChunks.map((chunk, index) => {
                const isExpanded = expandedChunks.has(chunk.id);
                const isSelected = selectedChunk === chunk.id;
                const previewLength = 200;
                const showPreview = chunk.content.length > previewLength && !isExpanded;
                const displayContent = showPreview 
                  ? chunk.content.substring(0, previewLength) + '...'
                  : chunk.content;

                return (
                  <Card
                    key={chunk.id}
                    className={cn(
                      "transition-all duration-200 hover:shadow-md cursor-pointer",
                      STRATEGY_COLORS[chunk.strategy],
                      isSelected && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedChunk(isSelected ? null : chunk.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Chunk {index + 1}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs capitalize",
                              chunk.strategy === 'fixed' && "bg-viz-blue/20 text-viz-blue",
                              chunk.strategy === 'sentence' && "bg-viz-purple/20 text-viz-purple",
                              chunk.strategy === 'paragraph' && "bg-viz-green/20 text-viz-green",
                              chunk.strategy === 'recursive' && "bg-viz-orange/20 text-viz-orange",
                              chunk.strategy === 'semantic' && "bg-viz-pink/20 text-viz-pink"
                            )}
                          >
                            {chunk.strategy}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyChunkContent(chunk.content);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleChunkExpansion(chunk.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="text-sm text-foreground leading-relaxed mb-3 font-mono">
                        {highlightSearchTerm(displayContent, searchTerm)}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>{chunk.characterCount} chars</span>
                          <span>{chunk.wordCount} words</span>
                          {chunk.overlap && chunk.overlap > 0 && (
                            <span className="text-warning">
                              {chunk.overlap} overlap
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Position: {chunk.startIndex}-{chunk.endIndex}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}