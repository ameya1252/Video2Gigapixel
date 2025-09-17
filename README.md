# Video2Gigapixel

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

Convert videos into an **ultra-high-resolution panoramic image** using Next.js (frontend) + Python/OpenCV (backend).

This project allows you to upload multiple video files and stitch selected frames into a single, massive panoramic image. The resulting panorama is displayed in an interactive viewer, providing a seamless way to explore the high-resolution output.

---

## ✨ Features
- **Multi-Video Upload:** Upload multiple videos to be processed at once.
- **Frame Stitching:** Python + OpenCV stitches frames into a panoramic image based on a user-defined `stepSize`.
- **Interactive Viewer:** Zoom, pan, fit-to-view, and optional grid/crosshair overlay.
- **Modern UI:** Built with Next.js, Tailwind CSS v4, and shadcn/radix for a clean, responsive interface.
- **Download:** Easily download the generated panoramic image.

---

## 🚀 Quick Start

### 1) Install Dependencies

**JavaScript dependencies:**
```bash
pnpm install
pnpm add -D @tailwindcss/postcss autoprefixer
```

Create or update `postcss.config.mjs`:
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**Python dependencies:**
```bash
pip install opencv-python numpy
```

---

### 2) Run the Dev Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🖼️ API Endpoint

**POST** `/api/process-video`  
**FormData:** `video1`, `video2`, … + `stepSize`  
**Response:**
```json
{ "imageUrl": "/panorama.jpg" }
```

---

## 🐍 Python Stitcher

Run manually:
```bash
python3 scripts/xyz.py --input "video1.mp4,video2.mp4" --output "public/panorama.jpg" --step 100
```

---

## 📂 Project Structure
```
app/          # Next.js App Router pages + API route
components/   # UI components (viewer, uploader)
scripts/      # Python stitcher
public/       # Output images
```

---

## 📦 Build & Deploy
```bash
pnpm run build
pnpm start
```
