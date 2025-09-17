"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Video, X, Terminal, FileVideo, Settings } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface UploadFormProps {
  onUpload: (files: File[], stepSize: number) => void
}

export default function UploadForm({ onUpload }: UploadFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [stepSize, setStepSize] = useState(100)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Change the file selection logic to remove the 2-video limit
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      const videoFiles = files.filter((file) => file.type.startsWith("video/"))

      if (videoFiles.length === 0) {
        alert("Please select video files")
        return
      }

      setSelectedFiles(videoFiles)
    }
  }

  // Similarly update the handleDrop function to remove the 2-video limit
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      const videoFiles = files.filter((file) => file.type.startsWith("video/"))

      if (videoFiles.length === 0) {
        alert("Please select video files")
        return
      }

      setSelectedFiles(videoFiles)
    }
  }

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles, stepSize)
    }
  }

  const clearSelection = () => {
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB"
    else return (bytes / 1073741824).toFixed(1) + " GB"
  }

  return (
    <div className="space-y-6">
      <div
        className={`tech-border p-8 text-center transition-all duration-300 ${
          dragActive ? "glow border-primary bg-primary/5" : ""
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          multiple
        />

        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className={`rounded-full p-5 ${dragActive ? "bg-primary/20" : "bg-terminal"}`}>
            <Upload className={`h-8 w-8 ${dragActive ? "text-primary" : "text-primary/80"}`} />
          </div>
          <div>
            {/* Update the upload text */}
            <p className="text-lg font-medium mb-2 terminal-text">
              <FileVideo className="inline mr-2 h-5 w-5" />
              Upload Video Scan{selectedFiles.length !== 1 ? "s" : ""}
            </p>
            <div className="bg-terminal p-2 rounded text-sm inline-block">
              <span className="terminal-text">$ import video_data --format=mp4,mov,avi --multi</span>
            </div>
          </div>
          {/* Update the Button text to reflect multiple selection */}
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-primary/30 hover:bg-primary/20 hover:text-primary"
          >
            <Terminal className="mr-2 h-4 w-4" />
            Select Video Files
          </Button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-2">
          <div className="bg-terminal inline-block px-3 py-1 rounded text-xs font-mono">
            <span className="text-primary">$</span> {selectedFiles.length} video file
            {selectedFiles.length !== 1 ? "s" : ""} selected
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.length <= 5 ? (
            // Show individual cards for 5 or fewer videos
            selectedFiles.map((file, index) => (
              <Card key={index} className="bg-terminal border-primary/20 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-primary/20 p-2">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-primary">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} | Video {index + 1}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newFiles = [...selectedFiles]
                        newFiles.splice(index, 1)
                        setSelectedFiles(newFiles)
                      }}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
                <div className="px-4 py-2 bg-background/20 border-t border-primary/10 text-xs font-mono">
                  <span className="text-primary">$</span> video {index + 1} ready for processing
                </div>
              </Card>
            ))
          ) : (
            // Show a summary card for more than 5 videos
            <Card className="bg-terminal border-primary/20 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono text-primary">{selectedFiles.length} Video Files Selected</p>
                      <p className="text-xs text-muted-foreground">
                        Total Size: {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearSelection}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear All</span>
                  </Button>
                </div>
                <div className="mt-2 space-y-1">
                  {selectedFiles.slice(0, 3).map((file, index) => (
                    <div key={index} className="text-xs font-mono flex justify-between">
                      <span className="text-primary-foreground truncate max-w-[250px]">{file.name}</span>
                      <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                  {selectedFiles.length > 3 && (
                    <div className="text-xs font-mono text-muted-foreground">
                      ...and {selectedFiles.length - 3} more files
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-2 bg-background/20 border-t border-primary/10 text-xs font-mono">
                <span className="text-primary">$</span> {selectedFiles.length} videos ready for processing
              </div>
            </Card>
          )}
        </div>
      )}

      <Card className="bg-terminal border-primary/20 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium terminal-text">Processing Parameters</h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="terminal-text">Frame Step Size</span>
              <span className="terminal-text">{stepSize}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs terminal-text">5</span>
              <Slider
                value={[stepSize]}
                min={5}
                max={200}
                step={5}
                onValueChange={(value) => setStepSize(value[0])}
                className="[&>span]:bg-primary"
              />
              <span className="text-xs terminal-text">200</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Lower values extract more frames (better quality, slower processing)
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0}
          className="bg-primary hover:bg-primary/90 text-primary-foreground relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center">
            <Terminal className="mr-2 h-4 w-4" />
            Execute Processing
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
        </Button>
      </div>
    </div>
  )
}
