"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Loader2, Terminal, AlertCircle } from "lucide-react"
import ImageViewer from "@/components/image-viewer"
import UploadForm from "@/components/upload-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (files: File[], stepSize: number) => {
    try {
      // Reset states
      setIsProcessing(true)
      setProgress(0)
      setError(null)

      // Create a FormData object to send the files
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`video${index + 1}`, file)
      })
      formData.append("stepSize", stepSize.toString())

      // Simulate progress updates (in a real app, you'd get these from the server)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 5
          return newProgress > 95 ? 95 : newProgress
        })
      }, 1000)

      // Send the files to the API route
      let response
      try {
        console.log(`Uploading ${files.length} video file(s) with step size ${stepSize}`)
        files.forEach((file, index) => {
          console.log(`Video ${index + 1}: ${file.name}, Size: ${file.size}`)
        })

        response = await fetch("/api/process-video", {
          method: "POST",
          body: formData,
        })
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error("Network error while uploading videos. Please try again.")
      }

      clearInterval(progressInterval)

      // Parse the response
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Parse error:", parseError)
        throw new Error("Failed to parse server response. Please try again.")
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.details || "Failed to process videos")
      }

      console.log("Processing complete, image URL:", data.imageUrl)
      setResultImage(data.imageUrl)
      setProgress(100)

      // Switch to the result tab after a short delay
      setTimeout(() => {
        setActiveTab("result")
        setIsProcessing(false)
      }, 1000)
    } catch (error) {
      console.error("Error processing videos:", error)
      setError(error.message || "An unexpected error occurred")
      setIsProcessing(false)
      setProgress(0)

      // Use a placeholder image in case of error
      setResultImage("/placeholder-panorama.png")
    }
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-tech-grid">
      <div className="absolute inset-0 bg-tech-glow pointer-events-none"></div>
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="mb-8 text-center relative tech-header">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-primary">
            <Terminal className="inline-block mr-2 h-8 w-8 mb-1" />
            Ultra-High-Resolution Image Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Convert video scans into detailed ultra-high-resolution panoramic images with advanced stitching technology
          </p>
        </div>

        <Card className="tech-panel shadow-lg border-primary/20">
          <CardHeader className="border-b border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-gradient-flow"></div>
            <CardTitle className="text-xl font-mono flex items-center">
              <span className="text-primary mr-2">~/</span>Image Processing Console
              <span className="text-primary animate-pulse ml-1">_</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/30">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Processing Error</AlertTitle>
                <AlertDescription className="font-mono text-xs">
                  {error}
                  {resultImage && <div className="mt-2">Using placeholder image for demonstration purposes.</div>}
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-terminal">
                <TabsTrigger value="upload" disabled={isProcessing} className="data-[state=active]:bg-primary/20">
                  <Terminal className="mr-2 h-4 w-4" /> Input
                </TabsTrigger>
                <TabsTrigger value="result" disabled={!resultImage} className="data-[state=active]:bg-primary/20">
                  <ImageIcon className="mr-2 h-4 w-4" /> Output
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-4">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-md bg-primary/30"></div>
                      <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
                    </div>
                    <div className="space-y-4 w-full max-w-md">
                      <h3 className="text-lg font-medium text-center terminal-text">Processing Video Frames</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="terminal-text">Analyzing frames...</span>
                          <span className="terminal-text">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 w-full bg-muted">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-full bg-gradient-to-r from-primary/50 to-primary animate-pulse"></div>
                          </div>
                        </Progress>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="terminal-text">$ extracting keypoints from multiple videos...</p>
                        <p className="terminal-text">$ matching features across videos...</p>
                        <p className="terminal-text">$ computing homography matrices...</p>
                        <p className="terminal-text">$ stitching panoramic image...</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <UploadForm onUpload={handleUpload} />
                )}
              </TabsContent>
              <TabsContent value="result" className="mt-4">
                {resultImage ? (
                  <ImageViewer imageUrl={resultImage} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="rounded-full bg-muted/30 p-6">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No image generated yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t border-primary/10 text-xs text-muted-foreground">
            <div className="flex justify-between w-full">
              <p className="terminal-text">CSCI 576 Multimedia Project - Spring 2025</p>
              <p className="terminal-text">v1.0.0</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
