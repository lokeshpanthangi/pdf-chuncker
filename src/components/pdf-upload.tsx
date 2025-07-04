import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface PDFUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
  uploadProgress?: number;
}

export function PDFUpload({ onFileUpload, isProcessing, uploadProgress = 0 }: PDFUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setUploadedFile(file);

    try {
      await onFileUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
      setUploadedFile(null);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  });

  return (
    <div className="space-y-4">
      <Card 
        className={cn(
          "transition-all duration-200 cursor-pointer border-2 border-dashed",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isProcessing && "pointer-events-none opacity-50"
        )}
      >
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className="text-center space-y-4"
          >
            <input {...getInputProps()} />
            
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              {isProcessing ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Upload className="w-6 h-6 text-white" />
              )}
            </div>

            {uploadedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">File uploaded successfully</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{uploadedFile.name}</span>
                  <span className="text-xs">
                    ({(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragActive ? "Drop your PDF here" : "Upload PDF Document"}
                </h3>
                <p className="text-muted-foreground">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 50MB
                </p>
              </div>
            )}

            {!uploadedFile && !isProcessing && (
              <Button variant="outline" className="mt-4">
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isProcessing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Processing PDF...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}