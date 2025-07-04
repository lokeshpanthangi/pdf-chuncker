import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChunkingResult } from '@/lib/chunking-strategies';
import { BarChart3, Clock, FileText, Target, TrendingUp, Zap } from 'lucide-react';

interface StatisticsDashboardProps {
  result: ChunkingResult | null;
  originalTextLength?: number;
  isLoading?: boolean;
}

export function StatisticsDashboard({ result, originalTextLength = 0, isLoading = false }: StatisticsDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!result) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Statistics Dashboard
          </CardTitle>
          <CardDescription>
            Process a document to see chunking statistics and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm">Upload and process a PDF to view statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chunkSizes = result.chunks.map(chunk => chunk.characterCount);
  const minChunk = Math.min(...chunkSizes);
  const maxChunk = Math.max(...chunkSizes);
  const medianChunk = [...chunkSizes].sort((a, b) => a - b)[Math.floor(chunkSizes.length / 2)];
  
  const sizeVariance = chunkSizes.reduce((sum, size) => {
    return sum + Math.pow(size - result.averageChunkSize, 2);
  }, 0) / chunkSizes.length;
  const standardDeviation = Math.sqrt(sizeVariance);

  const consistencyScore = Math.max(0, 100 - (standardDeviation / result.averageChunkSize) * 100);
  
  const compressionRatio = originalTextLength > 0 
    ? ((originalTextLength - (result.chunks.length * 50)) / originalTextLength) * 100 // Rough estimate
    : 0;

  const efficiency = result.processingTime > 0 
    ? Math.round((originalTextLength / result.processingTime) * 1000) // chars per second
    : 0;

  // Size distribution
  const getSizeDistribution = () => {
    const ranges = [
      { label: '0-500', min: 0, max: 500, color: 'bg-viz-blue' },
      { label: '501-1000', min: 501, max: 1000, color: 'bg-viz-green' },
      { label: '1001-2000', min: 1001, max: 2000, color: 'bg-viz-orange' },
      { label: '2000+', min: 2001, max: Infinity, color: 'bg-viz-purple' }
    ];

    return ranges.map(range => {
      const count = chunkSizes.filter(size => size >= range.min && size <= range.max).length;
      const percentage = (count / result.totalChunks) * 100;
      return { ...range, count, percentage };
    });
  };

  const sizeDistribution = getSizeDistribution();

  return (
    <div className="space-y-6">
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Chunks */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Chunks</p>
                <p className="text-3xl font-bold text-foreground">{result.totalChunks}</p>
              </div>
              <div className="p-3 bg-viz-blue/20 rounded-full">
                <FileText className="w-6 h-6 text-viz-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Chunk Size */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Size</p>
                <p className="text-3xl font-bold text-foreground">{result.averageChunkSize}</p>
                <p className="text-xs text-muted-foreground">characters</p>
              </div>
              <div className="p-3 bg-viz-green/20 rounded-full">
                <Target className="w-6 h-6 text-viz-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Time */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing Time</p>
                <p className="text-3xl font-bold text-foreground">{result.processingTime}</p>
                <p className="text-xs text-muted-foreground">milliseconds</p>
              </div>
              <div className="p-3 bg-viz-orange/20 rounded-full">
                <Clock className="w-6 h-6 text-viz-orange" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Size Range */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Size Range</p>
                <p className="text-lg font-bold text-foreground">{minChunk} - {maxChunk}</p>
                <p className="text-xs text-muted-foreground">min - max chars</p>
              </div>
              <div className="p-3 bg-viz-purple/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-viz-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consistency Score */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consistency</p>
                <p className="text-3xl font-bold text-foreground">{Math.round(consistencyScore)}%</p>
                <Progress value={consistencyScore} className="mt-2 h-2" />
              </div>
              <div className="p-3 bg-viz-pink/20 rounded-full">
                <Zap className="w-6 h-6 text-viz-pink" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Efficiency */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold text-foreground">{efficiency.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">chars/second</p>
              </div>
              <div className="p-3 bg-success/20 rounded-full">
                <Zap className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Size Distribution */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Chunk Size Distribution</CardTitle>
          <CardDescription>
            Distribution of chunk sizes across different ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sizeDistribution.map((range, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${range.color}`} />
                    <span className="font-medium">{range.label} chars</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{range.count} chunks</span>
                    <Badge variant="secondary">{range.percentage.toFixed(1)}%</Badge>
                  </div>
                </div>
                <Progress value={range.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Statistics */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Advanced Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{medianChunk}</p>
              <p className="text-sm text-muted-foreground">Median Size</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{Math.round(standardDeviation)}</p>
              <p className="text-sm text-muted-foreground">Standard Deviation</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{Math.round(result.averageChunkSize / 5)}</p>
              <p className="text-sm text-muted-foreground">Avg Words per Chunk</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}