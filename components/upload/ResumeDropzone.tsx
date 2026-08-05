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
    <Card className="w-full bg-slate-900/50 backdrop-blur border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px] transition-all hover:border-violet-500/50">
      <h3 className="text-xl font-medium mb-6 text-slate-200">📄 Upload Resume</h3>
      
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-violet-400' : 'text-slate-500'}`} />
          <p className="text-slate-300 font-medium">Drag & drop PDF</p>
          <p className="text-slate-500 text-sm mt-2">or click to browse</p>
        </div>
      ) : (
        <div className="w-full p-6 border border-emerald-500/30 bg-emerald-500/5 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-emerald-400 font-medium">{file.name}</p>
              <p className="text-slate-500 text-sm">
                {wordCount !== undefined ? `Parsed: ${wordCount} chunks` : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
              </p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </Card>
  );
}
