import cv2
import numpy as np
import os
import sys
import argparse
import time
import random
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, List


# ----------------------------------------------------------------------
#  Frame extraction
# ----------------------------------------------------------------------
def extract_key_frames(video_path: str,
                       step: int = 100,
                       resize_width: Optional[int] = None
                       ) -> List[np.ndarray]:
    """
    Grab every `step`‑th frame from *video_path*.

    Any frames that fail to decode are skipped.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {video_path}")
        return []

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()

    frame_indices = range(0, total_frames, step)

    def _read_single(idx: int):
        local_cap = cv2.VideoCapture(video_path)
        local_cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = local_cap.read()
        local_cap.release()
        if not ret:
            return None

        if resize_width and resize_width > 0:
            h, w = frame.shape[:2]
            if w > resize_width:
                new_h = int(h * resize_width / w)
                frame = cv2.resize(frame, (resize_width, new_h),
                                   interpolation=cv2.INTER_AREA)
        return frame

    with ThreadPoolExecutor() as pool:
        frames = list(pool.map(_read_single, frame_indices))

    return [f for f in frames if f is not None]


def collect_frames(video_paths: List[str],
                   step: int,
                   resize_width: Optional[int]) -> List[np.ndarray]:
    with ThreadPoolExecutor() as pool:
        parts = pool.map(lambda p: extract_key_frames(p, step, resize_width),
                         video_paths)
        frames: List[np.ndarray] = []
        for sub in parts:
            frames.extend(sub)
    return frames


# ----------------------------------------------------------------------
#  Stitch helpers
# ----------------------------------------------------------------------
def stitch(frames: List[np.ndarray]):
    stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
    print("[INFO] Stitching frames …")
    t0 = time.time()
    status, pano = stitcher.stitch(frames)
    print(f"[TIMER] Stitching finished in {time.time() - t0:.2f}s")
    return status, pano


def downsample_frames(frames: List[np.ndarray], max_frames: int) -> List[np.ndarray]:
    """Evenly sample frames down to ≤ max_frames."""
    if len(frames) <= max_frames:
        return frames
    step = len(frames) / max_frames
    return [frames[int(i * step)] for i in range(max_frames)]


def stitch_with_fallback(frames: List[np.ndarray],
                         max_attempts: int = 4) -> np.ndarray:
    """Try to stitch, halving the frame count on each failure."""
    attempt = 0
    while attempt < max_attempts and len(frames) >= 10:
        try:
            status, pano = stitch(frames)
            if status == cv2.Stitcher_OK and pano is not None:
                return pano
            print(f"[WARN] Stitcher failed (code {status}); retrying with fewer frames …")
        except Exception as exc:
            print(f"[WARN] Stitch threw {type(exc).__name__}: {exc}; retrying with fewer frames …")
        # random 50 % subset for the next attempt
        frames = random.sample(frames, len(frames) // 2)
        attempt += 1
    raise RuntimeError("Stitching failed after several attempts")


# ----------------------------------------------------------------------
#  CLI
# ----------------------------------------------------------------------
def parse_cli():
    parser = argparse.ArgumentParser(
        description="Create an ultra‑high‑resolution panorama from video(s)")
    parser.add_argument("--input", required=True,
                        help="Comma‑separated list of video files")
    parser.add_argument("--output", required=True,
                        help="Destination image (e.g. result.jpg)")
    parser.add_argument("--step", type=int, default=100,
                        help="Take every N‑th frame (default: 100)")
    parser.add_argument("--resize", type=int, default=None, metavar="WIDTH",
                        help="Down‑scale each frame so width ≤ WIDTH px")
    parser.add_argument("--max-frames", type=int, default=800, metavar="N",
                        help="Upper bound on frames fed to the stitcher (default: 800)")
    return parser.parse_args()


# ----------------------------------------------------------------------
#  Main
# ----------------------------------------------------------------------
def main():
    args = parse_cli()
    video_paths = [p.strip() for p in args.input.split(",") if p.strip()]

    # check inputs
    missing = [p for p in video_paths if not os.path.exists(p)]
    if missing:
        for m in missing:
            print(f"[ERROR] File not found: {m}")
        sys.exit(1)

    # frame extraction
    print(f"[INFO] Extracting frames (step={args.step}) …")
    frames = collect_frames(video_paths, args.step, args.resize)

    # filter out corrupt / zero‑sized
    frames = [f for f in frames if f is not None and f.size > 0]
    print(f"[INFO] Total usable frames extracted: {len(frames)}")
    if not frames:
        print("[ERROR] No valid frames extracted. Aborting.")
        sys.exit(1)

    # cap the total
    frames = downsample_frames(frames, args.max_frames)
    print(f"[INFO] Using {len(frames)} frame(s) for stitching")

    # stitching with fallback
    try:
        panorama = stitch_with_fallback(frames)
    except RuntimeError as err:
        print(f"[ERROR] {err}")
        sys.exit(1)

    # save result
    out_dir = os.path.dirname(args.output)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    cv2.imwrite(args.output, panorama)
    print(f"[INFO] Panorama saved to {args.output}")


if __name__ == "__main__":
    main()
