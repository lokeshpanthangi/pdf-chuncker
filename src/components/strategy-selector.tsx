import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ChunkingStrategy, ChunkingConfig } from '@/lib/chunking-strategies';

interface StrategySelectorProps {
  config: ChunkingConfig;
  onConfigChange: (config: ChunkingConfig) => void;
}

const STRATEGY_INFO = {
  fixed: {
    name: 'Fixed Size',
    description: 'Split text into equal-sized chunks with optional overlap',
    pros: ['Predictable chunk sizes', 'Simple implementation', 'Memory efficient'],
    cons: ['May break sentences/paragraphs', 'Context boundaries ignored'],
    color: 'bg-viz-blue text-white'
  },
  sentence: {
    name: 'Sentence-Based',
    description: 'Split text at sentence boundaries, combining to target size',
    pros: ['Preserves sentence integrity', 'Natural language boundaries', 'Good readability'],
    cons: ['Variable chunk sizes', 'Depends on sentence detection'],
    color: 'bg-viz-purple text-white'
  },
  paragraph: {
    name: 'Paragraph-Based',
    description: 'Use paragraph breaks as natural splitting points',
    pros: ['Preserves topic coherence', 'Natural content boundaries', 'Good for structured text'],
    cons: ['Very variable sizes', 'May create large chunks'],  
    color: 'bg-viz-green text-white'
  },
  recursive: {
    name: 'Recursive',
    description: 'Hierarchical splitting: paragraphs → sentences → words',
    pros: ['Intelligent splitting', 'Preserves context hierarchy', 'Flexible boundaries'],
    cons: ['More complex processing', 'Potentially slower'],
    color: 'bg-viz-orange text-white'
  },
  semantic: {
    name: 'Semantic',
    description: 'Topic-based splitting using keyword density heuristics',
    pros: ['Topic coherence', 'Semantic relationships', 'Context-aware'],
    cons: ['Heuristic-based', 'May miss subtle topics', 'Language dependent'],
    color: 'bg-viz-pink text-white'
  }
};

export function StrategySelector({ config, onConfigChange }: StrategySelectorProps) {
  const currentStrategyInfo = STRATEGY_INFO[config.strategy];

  const handleStrategyChange = (strategy: ChunkingStrategy) => {
    onConfigChange({ ...config, strategy });
  };

  const handleChunkSizeChange = (value: number[]) => {
    onConfigChange({ ...config, chunkSize: value[0] });
  };

  const handleOverlapChange = (value: number[]) => {
    onConfigChange({ ...config, overlap: value[0] });
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Chunking Strategy
          <Badge className={currentStrategyInfo.color}>
            {currentStrategyInfo.name}
          </Badge>
        </CardTitle>
        <CardDescription>
          {currentStrategyInfo.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Strategy Selection */}
        <div className="space-y-2">
          <Label htmlFor="strategy">Strategy Type</Label>
          <Select
            value={config.strategy}
            onValueChange={handleStrategyChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STRATEGY_INFO).map(([key, info]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${info.color.replace('text-white', '')}`} />
                    {info.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chunk Size Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="chunkSize">Chunk Size (characters)</Label>
            <span className="text-sm text-muted-foreground font-mono">
              {config.chunkSize.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[config.chunkSize]}
            onValueChange={handleChunkSizeChange}
            min={100}
            max={5000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100</span>
            <span>5,000</span>
          </div>
        </div>

        {/* Overlap Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="overlap">Overlap (characters)</Label>
            <span className="text-sm text-muted-foreground font-mono">
              {config.overlap.toLocaleString()}
            </span>
          </div>
          <Slider
            value={[config.overlap]}
            onValueChange={handleOverlapChange}
            min={0}
            max={Math.min(config.chunkSize / 2, 1000)}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>{Math.min(config.chunkSize / 2, 1000)}</span>
          </div>
        </div>

        {/* Strategy Info */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-success">Advantages</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              {currentStrategyInfo.pros.map((pro, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-success">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-warning">Considerations</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              {currentStrategyInfo.cons.map((con, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}