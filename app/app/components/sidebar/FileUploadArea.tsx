'use client'

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { Upload, FileText } from 'lucide-react'

interface FileUploadAreaProps {
  onFileUpload: (file: File) => void
  isUploading: boolean
}

export default function FileUploadArea({
  onFileUpload,
  isUploading,
}: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      validateAndUpload(file)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndUpload(file)
    }
  }

  const validateAndUpload = (file: File) => {
    const validTypes = ['text/plain', 'application/json', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a TXT, JSON, or PDF file')
      return
    }
    onFileUpload(file)
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl transition-all cursor-pointer p-8 text-neutral-900 ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-primary-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Upload size={48} className="animate-pulse text-primary-500" />
          ) : (
            <FileText size={48} className="text-primary-400" />
          )}
          <div>
            <p className="text-base font-medium text-neutral-900 mb-2">
              {isUploading
                ? 'Uploading...'
                : 'Drop your file here or click to browse'}
            </p>
            <p className="text-sm text-neutral-500">
              Supports TXT, JSON, and PDF files
            </p>
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.json,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
