'use client'

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { Upload, FileText } from 'lucide-react'

interface FileUploadAreaProps {
  onFileUpload: (file: File) => void
  isUploading: boolean
}

export default function FileUploadArea({ onFileUpload, isUploading }: FileUploadAreaProps) {
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
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Upload size={48} className="text-gray-400 animate-pulse" />
          ) : (
            <FileText size={48} className="text-gray-400" />
          )}
          <div>
            <p className="text-base font-medium text-gray-900">
              {isUploading ? 'Uploading...' : 'Drop your file here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
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
