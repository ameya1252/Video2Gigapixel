"use client"

import { useState, useRef, useEffect } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize,
  Grid,
  Crosshair,
  FullscreenIcon as FitScreen,
} from "lucide-react"

interface ImageViewerProps {
  imageUrl: string
}

export default function ImageViewer({ imageUrl }: ImageViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [showCrosshair, setShowCrosshair] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const transformComponentRef = useRef(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Reset image error state when imageUrl changes
  useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
  }, [imageUrl])

  // Fit image to view when it loads
  useEffect(() => {
    if (imageLoaded && transformComponentRef.current) {
      // Small delay to ensure the image dimensions are available
      setTimeout(() => {
        // @ts-ignore - The library types are not perfect
        transformComponentRef.current?.resetTransform()
        fitImageToView()
      }, 100)
    }
  }, [imageLoaded])

  const handleZoomSlider = (value: number[]) => {
    const zoom = value[0]
    setZoomLevel(zoom)

    // @ts-ignore - The library types are not perfect
    if (transformComponentRef.current?.setTransform) {
      // @ts-ignore
      transformComponentRef.current.setTransform(
        // @ts-ignore
        transformComponentRef.current.state.positionX,
        // @ts-ignore
        transformComponentRef.current.state.positionY,
        zoom,
      )
    }
  }

  const handleDownload = () => {
    if (imageError || !imageLoaded) return

    const link = document.createElement("a")
    link.href = imageUrl
    link.download = "ultra-high-resolution-image.jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImageError = () => {
    console.error("Error loading image:", imageUrl)
    setImageError(true)
    setImageLoaded(false)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const fitImageToView = () => {
    if (!transformComponentRef.current || !imageRef.current) return

    const container = document.querySelector(".image-container")
    if (!container) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const imageWidth = imageRef.current.naturalWidth
    const imageHeight = imageRef.current.naturalHeight

    // Calculate the scale needed to fit the image in the container
    // with a small margin (0.9)
    const scaleX = (containerWidth / imageWidth) * 0.9
    const scaleY = (containerHeight / imageHeight) * 0.9

    // Use the smaller scale to ensure the entire image fits
    const scale = Math.min(scaleX, scaleY)

    // Don't zoom in more than 1x
    const finalScale = Math.min(scale, 1)

    setZoomLevel(finalScale)

    // @ts-ignore - The library types are not perfect
    transformComponentRef.current.setTransform(0, 0, finalScale)
  }

  // Use a fallback image if the main image fails to load
  const displayUrl = imageError ? "/placeholder-panorama.png" : imageUrl

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              // @ts-ignore
              transformComponentRef.current?.zoomOut()
            }}
            className="border-primary/30 hover:bg-primary/20 hover:text-primary"
            disabled={!imageLoaded}
          >
            <ZoomOut className="h-4 w-4" />
            <span className="sr-only">Zoom Out</span>
          </Button>

          <div className="w-48 px-2">
            <Slider
              value={[zoomLevel]}
              min={0.1}
              max={5}
              step={0.1}
              onValueChange={handleZoomSlider}
              className="[&>span]:bg-primary [&>span]:h-2"
              disabled={!imageLoaded}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              // @ts-ignore
              transformComponentRef.current?.zoomIn()
            }}
            className="border-primary/30 hover:bg-primary/20 hover:text-primary"
            disabled={!imageLoaded}
          >
            <ZoomIn className="h-4 w-4" />
            <span className="sr-only">Zoom In</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fitImageToView}
            className="border-primary/30 hover:bg-primary/20 hover:text-primary"
            disabled={!imageLoaded}
            title="Fit to view"
          >
            <FitScreen className="h-4 w-4" />
            <span className="sr-only">Fit to View</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowGrid(!showGrid)}
            className={`border-primary/30 hover:bg-primary/20 hover:text-primary ${
              showGrid ? "bg-primary/20 text-primary" : ""
            }`}
            disabled={!imageLoaded}
          >
            <Grid className="h-4 w-4" />
            <span className="sr-only">Toggle Grid</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowCrosshair(!showCrosshair)}
            className={`border-primary/30 hover:bg-primary/20 hover:text-primary ${
              showCrosshair ? "bg-primary/20 text-primary" : ""
            }`}
            disabled={!imageLoaded}
          >
            <Crosshair className="h-4 w-4" />
            <span className="sr-only">Toggle Crosshair</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              // @ts-ignore
              transformComponentRef.current?.resetTransform()
              setZoomLevel(1)
            }}
            className="border-primary/30 hover:bg-primary/20 hover:text-primary"
            disabled={!imageLoaded}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={imageError || !imageLoaded}
            className="border-primary/30 hover:bg-primary/20 hover:text-primary"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </div>

      <div className="tech-border h-[500px] flex items-center justify-center relative overflow-hidden bg-terminal/30 image-container">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-md bg-primary/30"></div>
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin relative z-10"></div>
            </div>
          </div>
        )}

        {showCrosshair && imageLoaded && (
          <>
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-primary/30 z-10 pointer-events-none"></div>
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-primary/30 z-10 pointer-events-none"></div>
          </>
        )}

        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={5}
          ref={transformComponentRef}
          onZoom={(ref) => setZoomLevel(ref.state.scale)}
          centerOnInit
          disabled={!imageLoaded}
          limitToBounds={false}
        >
          <TransformComponent wrapperClassName="w-full h-full" contentClassName="flex items-center justify-center">
            <div className="relative">
              <img
                ref={imageRef}
                src={displayUrl || "/placeholder.svg"}
                alt="Ultra-high-resolution stitched image"
                className="max-w-none"
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ backgroundColor: "black" }} // Ensure black background is visible
              />
              {showGrid && imageLoaded && (
                <div className="absolute inset-0 bg-tech-grid bg-[size:50px_50px] pointer-events-none"></div>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>

        {imageLoaded && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-primary">
            <span className="mr-2">Zoom: {zoomLevel.toFixed(1)}x</span>
            <span>
              <Maximize className="inline h-3 w-3 mr-1" />
              Ultra-High-Resolution
            </span>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center font-mono bg-terminal p-2 rounded-md">
        <span className="text-primary">$</span> Image processing complete • Drag to pan • Scroll to zoom •
        <span className="text-primary ml-1">Resolution: Ultra-High</span>
      </div>
    </div>
  )
}
