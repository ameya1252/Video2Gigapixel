import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { promisify } from "util"
import fs from "fs"

const execPromise = promisify(exec)

// Set to false to use actual Python processing
const USE_PLACEHOLDER = false

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()

    // Check for video files in the form data
    const videoFiles: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("video") && value instanceof File) {
        videoFiles.push(value as File)
      }
    }

    if (videoFiles.length === 0) {
      return NextResponse.json({ error: "No video files provided" }, { status: 400 })
    }

    // Get step size from form data
    const stepSize = Number.parseInt(formData.get("stepSize") as string) || 100

    // If using placeholder, return immediately
    if (USE_PLACEHOLDER) {
      return NextResponse.json({
        imageUrl: "/placeholder-panorama.png",
        message: "Using placeholder image for demonstration",
      })
    }

    // Create temp directories for local development
    const tmpDir = path.join(process.cwd(), "tmp")
    const outputDir = path.join(process.cwd(), "public", "output")

    try {
      // Ensure directories exist
      if (!fs.existsSync(tmpDir)) {
        await mkdir(tmpDir, { recursive: true })
      }
      if (!fs.existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true })
      }
    } catch (error) {
      console.error("Error creating directories:", error)
      return NextResponse.json({ error: "Failed to create necessary directories" }, { status: 500 })
    }

    // Create temporary file paths for the uploaded videos
    const videoPaths: string[] = []

    for (let i = 0; i < videoFiles.length; i++) {
      const videoFile = videoFiles[i]
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
      const videoFileName = `upload-${Date.now()}-${i + 1}.mp4`
      const videoPath = path.join(tmpDir, videoFileName)

      // Write the video file to disk
      try {
        await writeFile(videoPath, videoBuffer)
        console.log(`Video ${i + 1} saved to ${videoPath}`)
        videoPaths.push(videoPath)
      } catch (writeError) {
        console.error(`Error writing video file ${i + 1}:`, writeError)
        return NextResponse.json({ error: `Failed to save uploaded video ${i + 1}` }, { status: 500 })
      }
    }

    // Output image path - save to public/output so it's accessible via URL
    const outputImageName = `panorama-${Date.now()}.jpg`
    const outputImagePath = path.join(outputDir, outputImageName)

    try {
      // Check if the Python script exists
      const scriptPath = path.join(process.cwd(), "scripts", "xyz.py")
      if (!fs.existsSync(scriptPath)) {
        console.error("Python script not found:", scriptPath)
        return NextResponse.json({ error: "Processing script not found" }, { status: 500 })
      }

      console.log(`Executing Python script: ${scriptPath}`)
      console.log(`Input videos: ${videoPaths.join(", ")}`)
      console.log(`Output image: ${outputImagePath}`)
      console.log(`Step size: ${stepSize}`)

      // Execute the Python script with multiple video paths
      const { stdout, stderr } = await execPromise(
        `python3 "${scriptPath}" --input "${videoPaths.join(",")}" --output "${outputImagePath}" --step ${stepSize}`,
      )

      console.log("Python script output:", stdout)

      if (stderr) {
        console.error("Python script stderr:", stderr)
        if (stderr.toLowerCase().includes("error") && !stderr.toLowerCase().includes("warning")) {
          throw new Error(`Python script error: ${stderr}`)
        }
      }

      // Check if the output file was created
      if (!fs.existsSync(outputImagePath)) {
        throw new Error(`Output image was not created at: ${outputImagePath}`)
      }

      // Get file size for debugging
      const stats = fs.statSync(outputImagePath)
      console.log(`Output image size: ${stats.size} bytes`)

      if (stats.size === 0) {
        throw new Error("Output image file is empty")
      }

      // Return the URL to the image (relative to public folder)
      return NextResponse.json({
        imageUrl: `/output/${outputImageName}`,
        message: "Videos processed successfully",
      })
    } catch (execError) {
      console.error("Failed to execute Python script:", execError)
      return NextResponse.json(
        {
          error: "Failed to process videos with Python script",
          details: execError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing videos:", error)
    return NextResponse.json(
      {
        error: "Failed to process videos",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
