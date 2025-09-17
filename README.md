# Video2Gigapixel

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

## Overview

**Video2Gigapixel** is a full-stack application that converts ordinary videos into **ultra-high-resolution gigapixel images**.  
Users can upload a video, the backend pipeline processes frames, stitches them together using computer vision algorithms, and outputs a seamless, zoomable panoramic image.

The output can be explored interactively using a deep-zoom viewer with smooth pan and zoom functionality.

---

## Features

- **Video Upload:** Simple, intuitive web interface for video uploads.
- **Frame Extraction & Stitching:** Backend Python pipeline using OpenCV, feature matching, and blending algorithms.
- **Ultra-High-Resolution Output:** Generates gigapixel panoramas from ordinary videos.
- **Deep Zoom Viewer:** Interactive exploration with OpenSeadragon.
- **Asynchronous Processing:** Handles large files using background job queues.

---

## Tech Stack

- **Frontend:** Next.js, TypeScript, OpenSeadragon  
- **Backend:** FastAPI (Python), Celery/RQ for async jobs  
- **Computer Vision:** OpenCV, NumPy, Python  
- **Storage:** AWS S3 / Local storage for image tiles & outputs  
- **Deployment:** Vercel (Frontend), Docker (Backend)

---

## How It Works

1. **Upload Video**: User uploads a video through the frontend.
2. **Frame Processing**: Backend extracts frames, aligns them using feature matching (SIFT/ORB + RANSAC).
3. **Stitching**: Frames are stitched into a seamless high-resolution panorama.
4. **Tiling & Viewing**: Final image is tiled for Deep Zoom viewing.

---

## Setup & Deployment

### Backend
```bash
cd backend
docker-compose up --build
