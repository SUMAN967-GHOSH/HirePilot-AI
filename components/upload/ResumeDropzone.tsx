'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ResumeDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  wordCount?: number;
}

export function ResumeDropzone({ file, onFileSelect, wordCount }: ResumeDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <Card className="w-full bg-card/50 backdrop-blur border-border p-6 flex flex-col items-center justify-center min-h-[300px] transition-all hover:border-primary/50">
      <h3 className="text-xl font-medium mb-6 text-card-foreground">📄 Upload Resume</h3>
      
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-background/50'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground/70'}`} />
          <p className="text-foreground font-medium">Drag & drop PDF</p>
          <p className="text-muted-foreground/70 text-sm mt-2">or click to browse</p>
        </div>
      ) : (
        <div className="w-full p-6 border border-emerald-500/30 bg-emerald-500/5 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-emerald-400 font-medium">{file.name}</p>
              <p className="text-muted-foreground/70 text-sm">
                {wordCount !== undefined ? `Parsed: ${wordCount} chunks` : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </Card>
  );
}
